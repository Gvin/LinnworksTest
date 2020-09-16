using System.Collections.Generic;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController
    {
        private readonly ISalesService _salesService;

        public SalesController(ISalesService salesService)
        {
            _salesService = salesService;
        }

        [Authorize(Roles = UserRole.AdministratorRole + "," + UserRole.ManagerRole + "," + UserRole.ReaderRole)]
        [HttpGet]
        public async IAsyncEnumerable<SaleDataClientModel> GetSales(int startIndex, int count)
        {
            await foreach (var sale in _salesService.GetSales(startIndex, count))
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
    }
}