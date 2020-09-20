using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using LinnworksBackend.Hubs;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private const string CsvDelimiter = ",";
        private const string CsvDateFormat = "M/d/yyyy";

        private readonly ILogger<SalesController> _log;
        private readonly ISalesService _salesService;
        private readonly IHubContext<SalesImportProgressHub> _progressHubContext;

        public SalesController(
            ILogger<SalesController> log,
            ISalesService salesService,
            IHubContext<SalesImportProgressHub> progressHubContext)
        {
            _log = log;
            _salesService = salesService;
            _progressHubContext = progressHubContext;
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet]
        public async IAsyncEnumerable<SaleDataClientModel> GetSales(string filter, string sort, int pageIndex, int pageSize)
        {
            _log.LogInformation("GetSales");

            var startIndex = pageIndex * pageSize;
            await foreach (var sale in _salesService.GetSales(filter, sort, startIndex, pageSize))
            {
                yield return new SaleDataClientModel
                {
                    Country = sale.Country,
                    ItemType = sale.ItemType,
                    OrderDate = sale.OrderDate.ToString("yyyy-MM-dd"),
                    OrderId = sale.OrderId,
                    OrderPriority = sale.OrderPriority,
                    Region = sale.Region,
                    SalesChannel = sale.SalesChannel,
                    ShipDate = sale.ShipDate.Date.ToString("yyyy-MM-dd"),
                    TotalCost = sale.TotalCost,
                    TotalProfit = sale.TotalProfit,
                    TotalRevenue = sale.TotalRevenue,
                    UnitCost = sale.UnitCost,
                    UnitPrice = sale.UnitPrice,
                    UnitsSold = sale.UnitsSold
                };
            }
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet("count")]
        public async Task<int> GetCount(string filter)
        {
            _log.LogInformation("GetCount");

            return await _salesService.GetSalesCount(filter);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] SaleDataViewModel saleData)
        {
            _log.LogInformation("Create");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var saleDataModel = ConvertViewModel(saleData);

            await _salesService.SaveSaleData(saleDataModel);
            return Ok(true);
        }

        private SaleDataModel ConvertViewModel(SaleDataViewModel viewModel)
        {
            var result = new SaleDataModel
            {
                SalesChannel = viewModel.SalesChannel,
                TotalCost = decimal.Parse(viewModel.TotalCost),
                Region = viewModel.Region,
                TotalProfit = decimal.Parse(viewModel.TotalProfit),
                OrderPriority = viewModel.OrderPriority,
                UnitCost = decimal.Parse(viewModel.UnitCost),
                TotalRevenue = decimal.Parse(viewModel.TotalRevenue),
                ShipDate = viewModel.ShipDate,
                UnitsSold = viewModel.UnitsSold,
                UnitPrice = decimal.Parse(viewModel.UnitPrice),
                ItemType = viewModel.ItemType,
                Country = viewModel.Country,
                OrderDate = viewModel.OrderDate
            };

            if (viewModel.OrderId.HasValue)
            {
                result.OrderId = viewModel.OrderId.Value;
            }

            return result;
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("delete")]
        public async Task<IActionResult> Delete()
        {
            _log.LogInformation("Delete");

            var idsString = (string) Request.Form["ids"];
            var ids = idsString.Split(",").Select(id => long.Parse(id)).ToArray();
            await _salesService.DeleteSales(ids);
            return Ok(true);
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet("countries")]
        public async Task<string[]> Countries()
        {
            return await _salesService.GetCountries();
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet("statistics")]
        public async Task<SalesStatisticsClientModel[]> Statistics(string country)
        {
            return await _salesService.GetStatistics(country);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] SaleDataViewModel saleData)
        {
            _log.LogInformation("Update");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var record = ConvertViewModel(saleData);

            var updateResult = await _salesService.AddOrUpdateRecord(record);
            return Ok(updateResult);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("import")]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> Import()
        {
            _log.LogInformation("Import");

            await _progressHubContext
                .Clients
                .All
                .SendAsync("taskStarted");

            var salesDataToSave = new Dictionary<long, SaleDataModel>();

            _log.LogDebug("Import -> Reading files");
            for (var fileIndex = 0; fileIndex < Request.Form.Files.Count; fileIndex++)
            {
                var file = Request.Form.Files[fileIndex];
                var fileLines = ReadFileLines(file);

                var header = fileLines[0].Split(CsvDelimiter);

                for (var lineIndex = 1; lineIndex < fileLines.Length; lineIndex++)
                {
                    var line = fileLines[lineIndex];
                    var record = ReadRecord(line, header);
                    var saleData = ConvertRecord(record);

                    if (salesDataToSave.ContainsKey(saleData.OrderId))
                    {
                        salesDataToSave[saleData.OrderId] = saleData;
                    }
                    else
                    {
                        salesDataToSave.Add(saleData.OrderId, saleData);
                    }

                    _progressHubContext
                        .Clients
                        .All
                        .SendAsync("readDataProgressChanged", fileIndex, Request.Form.Files.Count, lineIndex, fileLines.Length).Wait();
                }
            }

            _log.LogDebug("Import -> Saving data");
            var dataToSave = salesDataToSave.Values.ToArray();
            for (int index = 0; index < dataToSave.Length; index++)
            {
                var saleData = dataToSave[index];
                var saved = await _salesService.AddOrUpdateRecord(saleData);
                _progressHubContext
                    .Clients
                    .All
                    .SendAsync("saveDataProgressChanged", index, dataToSave.Length).Wait();
            }

            _log.LogDebug("Import -> Done");

            await _progressHubContext
                .Clients
                .All
                .SendAsync("taskEnded");

            return Ok(true);
        }

        private SaleDataModel ConvertRecord(Dictionary<string, string> record)
        {
            return new SaleDataModel
            {
                OrderId = long.Parse(record["Order ID"]),
                Country = record["Country"],
                TotalCost = decimal.Parse(record["Total Cost"]),
                Region = record["Region"],
                TotalProfit = decimal.Parse(record["Total Profit"]),
                OrderPriority = record["Order Priority"],
                UnitCost = decimal.Parse(record["Unit Cost"]),
                TotalRevenue = decimal.Parse(record["Total Revenue"]),
                ShipDate = DateTime.ParseExact(record["Ship Date"], CsvDateFormat, null),
                UnitsSold = int.Parse(record["Units Sold"]),
                UnitPrice = decimal.Parse(record["Unit Price"]),
                ItemType = record["Item Type"],
                SalesChannel = record["Sales Channel"],
                OrderDate = DateTime.ParseExact(record["Order Date"], CsvDateFormat, null)
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

        private string[] ReadFileLines(IFormFile file)
        {
            var lines = new List<string>();
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                while (!reader.EndOfStream)
                {
                    lines.Add(reader.ReadLine());
                }
            }

            return lines.ToArray();
        }
    }
}