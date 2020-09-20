using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Services;

namespace LinnworksBackend.Data.AsyncJobs
{
    public class ImportAsyncJob : IAsyncJob
    {
        private const string CsvDelimiter = ",";
        private const string CsvDateFormat = "M/d/yyyy";

        private readonly string[] _fileLines;
        private readonly ISalesService _salesService;

        public ImportAsyncJob(string[] fileLines, ISalesService salesService)
        {
            _fileLines = fileLines;
            _salesService = salesService;
            Complete = false;
        }

        public bool Complete { get; private set; }

        public int Progress { get; private set; }

        public void Run()
        {
            Task.Run(() =>
            {

                var headerLine = _fileLines[0];
                if (string.IsNullOrEmpty(headerLine))
                    throw new ApplicationException("Invalid CSV file header format");

                var columns = headerLine.Split(CsvDelimiter).Select(column => column.ToLower()).ToArray();

                for (int index = 1; index < _fileLines.Length; index++)
                {
                    Progress = (int)Math.Floor(100d * index / _fileLines.Length);
                    var record = ReadRecord(_fileLines[index], columns);
                    var data = ConvertRecord(record);
                    _salesService.AddOrUpdateRecord(data).Wait();
                }

                Progress = 100;
                Complete = true;
            });
        }

        private SaleDataModel ConvertRecord(Dictionary<string, string> record)
        {
            return new SaleDataModel
            {
                OrderId = long.Parse(record["order id"]),
                Country = record["country"],
                TotalCost = decimal.Parse(record["total cost"]),
                Region = record["region"],
                TotalProfit = decimal.Parse(record["total profit"]),
                OrderPriority = record["order priority"],
                UnitCost = decimal.Parse(record["unit cost"]),
                TotalRevenue = decimal.Parse(record["total revenue"]),
                ShipDate = DateTime.ParseExact(record["ship date"], CsvDateFormat, null),
                UnitsSold = int.Parse(record["units sold"]),
                UnitPrice = decimal.Parse(record["unit price"]),
                ItemType = record["item type"],
                SalesChannel = record["sales channel"],
                OrderDate = DateTime.ParseExact(record["order date"], CsvDateFormat, null)
            };
        }

        private Dictionary<string, string> ReadRecord(string dataLine, string[] columns)
        {
            if (string.IsNullOrEmpty(dataLine))
                throw new ApplicationException("Invalid CSV file format");

            var data = dataLine.Split(CsvDelimiter);
            if (data.Length != columns.Length)
                throw new ApplicationException("CSV columns and data count doesn't match");

            var record = new Dictionary<string, string>();
            for (int index = 0; index < columns.Length; index++)
            {
                var column = columns[index];
                var value = data[index];
                record.Add(column, value);
            }

            return record;
        }
    }

    // public class ImportAsyncJob : IAsyncJob
    // {
    //     private const string CsvDelimiter = ",";
    //     private const string CsvDateFormat = "M/d/yyyy";
    //
    //     private readonly Stream _fileStream;
    //     private readonly ISalesService _salesService;
    //
    //     public ImportAsyncJob(Stream fileStream, ISalesService salesService)
    //     {
    //         _fileStream = fileStream;
    //         _salesService = salesService;
    //         Complete = false;
    //     }
    //
    //     public bool Complete { get; private set; }
    //
    //     public int Progress { get; private set; }
    //
    //     public void Run()
    //     {
    //         Task.Run(() =>
    //         {
    //             using (var fileReader = new StreamReader(_fileStream))
    //             {
    //                 
    //             }
    //
    //             using (var reader = new StreamReader(_fileStream))
    //             {
    //                 var headerLine = reader.ReadLine();
    //                 if (string.IsNullOrEmpty(headerLine))
    //                     throw new ApplicationException("Invalid CSV file header format");
    //
    //                 var columns = headerLine.Split(CsvDelimiter).Select(column => column.ToLower()).ToArray();
    //
    //                 while (!reader.EndOfStream)
    //                 {
    //                     Progress = (int) Math.Floor(100d * _fileStream.Position / _fileStream.Length);
    //
    //                     var record = ReadRecord(reader, columns);
    //                     var data = ConvertRecord(record);
    //                     _salesService.AddOrUpdateRecord(data).Wait();
    //                 }
    //             }
    //
    //             Progress = 100;
    //             Complete = true;
    //         });
    //     }
    //
    //     private SaleDataModel ConvertRecord(Dictionary<string, string> record)
    //     {
    //         return new SaleDataModel
    //         {
    //             OrderId = long.Parse(record["order id"]),
    //             Country = record["country"],
    //             TotalCost = decimal.Parse(record["total cost"]),
    //             Region = record["region"],
    //             TotalProfit = decimal.Parse(record["total profit"]),
    //             OrderPriority = record["order priority"],
    //             UnitCost = decimal.Parse(record["unit cost"]),
    //             TotalRevenue = decimal.Parse(record["total revenue"]),
    //             ShipDate = DateTime.ParseExact(record["ship date"], CsvDateFormat, null),
    //             UnitsSold = int.Parse(record["units sold"]),
    //             UnitPrice = decimal.Parse(record["unit price"]),
    //             ItemType = record["item type"],
    //             SalesChannel = record["sales channel"],
    //             OrderDate = DateTime.ParseExact(record["order date"], CsvDateFormat, null)
    //         };
    //     }
    //
    //     private Dictionary<string, string> ReadRecord(StreamReader reader, string[] columns)
    //     {
    //         var dataLine = reader.ReadLine();
    //         if (string.IsNullOrEmpty(dataLine))
    //             throw new ApplicationException("Invalid CSV file format");
    //
    //         var data = dataLine.Split(CsvDelimiter);
    //         if (data.Length != columns.Length)
    //             throw new ApplicationException("CSV columns and data count doesn't match");
    //
    //         var record = new Dictionary<string, string>();
    //         for (int index = 0; index < columns.Length; index++)
    //         {
    //             var column = columns[index];
    //             var value = data[index];
    //             record.Add(column, value);
    //         }
    //
    //         return record;
    //     }
    // }
}