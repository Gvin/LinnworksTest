using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using LinnworksBackend.Data.AsyncJobs;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly ISalesService _salesService;
        private readonly IAsyncJobsProcessor _asyncJobsProcessor;
        private readonly IServiceProvider _serviceProvider;

        public SalesController(
            ISalesService salesService,
            IAsyncJobsProcessor asyncJobsProcessor,
            IServiceProvider serviceProvider)
        {
            _salesService = salesService;
            _asyncJobsProcessor = asyncJobsProcessor;
            _serviceProvider = serviceProvider;
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet]
        public async IAsyncEnumerable<SaleDataClientModel> GetSales(string filter, string sort, int pageIndex, int pageSize)
        {
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
            return await _salesService.GetSalesCount(filter);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] SaleDataViewModel saleData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var saleDataModel = new SaleDataModel
            {
                SalesChannel = saleData.SalesChannel,
                TotalCost = decimal.Parse(saleData.TotalCost),
                Region = saleData.Region,
                TotalProfit = decimal.Parse(saleData.TotalProfit),
                OrderPriority = saleData.OrderPriority,
                UnitCost = decimal.Parse(saleData.UnitCost),
                TotalRevenue = decimal.Parse(saleData.TotalRevenue),
                ShipDate = saleData.ShipDate,
                UnitsSold = saleData.UnitsSold,
                UnitPrice = decimal.Parse(saleData.UnitPrice),
                ItemType = saleData.ItemType,
                Country = saleData.Country,
                OrderDate = saleData.OrderDate
            };

            await _salesService.SaveSaleData(saleDataModel);
            return Ok(true);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("delete")]
        public async Task<IActionResult> Delete()
        {
            var idsString = (string) Request.Form["ids"];
            var ids = idsString.Split(",").Select(id => long.Parse(id)).ToArray();
            await _salesService.DeleteSales(ids);
            return Ok(true);
        }

        [Authorize(Roles = UserRole.RolesCanEditSales)]
        [HttpPost("import")]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public async Task<IActionResult> Import()
        {
            var files = Request.Form.Files;

            var asyncJobIds = new List<string>();
            foreach (var file in files)
            {
                var fileLines = ReadFileLines(file);
                var job = new ImportAsyncJob(fileLines, _salesService);
                var jobId = _asyncJobsProcessor.RegisterAsyncJob(job);
                asyncJobIds.Add(jobId);
            }

            
            // var batches = new List<SaleDataModel>();
            // foreach (var file in files)
            // {
            //     var data = _csvReaderService.ReadData(file.OpenReadStream());
            //     batches.AddRange(data);
            // }
            //
            // var mergedData = MergeRecords(batches.ToArray());
            // await _salesService.SaveSalesData(mergedData);
            return Ok(true);
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

        [HttpGet("import-status")]
        public IActionResult GetImportProgress(string jobId)
        {
            var job = _asyncJobsProcessor.GetJob<ImportAsyncJob>(jobId);
            if (job == null)
            {
                return NotFound();
            }

            return Ok(job.Progress);
        }

        private SaleDataModel[] MergeRecords(SaleDataModel[] records)
        {
            var result = new Dictionary<long, SaleDataModel>();
            foreach (var record in records)
            {
                if (result.ContainsKey(record.OrderId))
                {
                    result[record.OrderId] = record;
                }
                else
                {
                    result.Add(record.OrderId, record);
                }
            }

            return result.Values.ToArray();
        }
    }
}