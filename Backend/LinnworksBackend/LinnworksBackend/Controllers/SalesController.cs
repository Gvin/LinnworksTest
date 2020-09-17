using System.Collections.Generic;
using System.Threading.Tasks;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly ISalesService _salesService;

        public SalesController(ISalesService salesService)
        {
            _salesService = salesService;
        }

        [Authorize(Roles = UserRole.RolesCanViewSales)]
        [HttpGet]
        public async IAsyncEnumerable<SaleDataClientModel> GetSales(int pageIndex, int pageSize)
        {
            var startIndex = pageIndex * pageSize;
            await foreach (var sale in _salesService.GetSales(startIndex, pageSize))
            {
                yield return new SaleDataClientModel
                {
                    Country = sale.Country,
                    ItemType = sale.ItemType,
                    OrderDate = sale.OrderDate,
                    OrderId = sale.OrderId,
                    OrderPriority = sale.OrderPriority,
                    Region = sale.Region,
                    SalesChannel = sale.SalesChannel,
                    ShipDate = sale.ShipDate,
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
        public async Task<int> GetCount()
        {
            return await _salesService.GetSalesCount();
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
                TotalCost = saleData.TotalCost,
                Region = saleData.Region,
                TotalProfit = saleData.TotalProfit,
                OrderPriority = saleData.OrderPriority,
                UnitCost = saleData.UnitCost,
                TotalRevenue = saleData.TotalRevenue,
                ShipDate = saleData.ShipDate,
                UnitsSold = saleData.UnitsSold,
                UnitPrice = saleData.UnitPrice,
                ItemType = saleData.ItemType,
                Country = saleData.Country,
                OrderDate = saleData.OrderDate
            };

            await _salesService.SaveSaleData(saleDataModel);
            return Ok();
        }
    }
}