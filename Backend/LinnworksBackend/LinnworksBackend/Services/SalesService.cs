using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LinnworksBackend.Data;
using LinnworksBackend.Model.Database;
using Microsoft.EntityFrameworkCore;

namespace LinnworksBackend.Services
{
    public interface ISalesService
    {
        IAsyncEnumerable<SaleDataModel> GetSales(int skip, int count);

        Task SaveSaleData(SaleDataModel saleData);

        Task<int> GetSalesCount();
    }

    public class SalesService : ISalesService
    {
        private readonly ApplicationDatabase _database;

        public SalesService(ApplicationDatabase database)
        {
            _database = database;
        }

        public IAsyncEnumerable<SaleDataModel> GetSales(int skip, int count)
        {
            return _database.Sales
                .Skip(skip)
                .Take(count).AsAsyncEnumerable();
        }

        public async Task<int> GetSalesCount()
        {
            return await _database.Sales.CountAsync();
        }

        public async Task SaveSaleData(SaleDataModel saleData)
        {
            await _database.Sales.AddAsync(saleData);
        }
    }
}