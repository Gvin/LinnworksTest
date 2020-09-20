using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LinnworksBackend.Data;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using Microsoft.EntityFrameworkCore;

namespace LinnworksBackend.Services
{
    public interface ISalesService
    {
        IAsyncEnumerable<SaleDataModel> GetSales(string filter, string sort, int skip, int count);

        Task SaveSaleData(SaleDataModel saleData);

        Task SaveSalesData(SaleDataModel[] sales);

        Task<int> GetSalesCount(string filter);

        Task DeleteSales(long[] ids);

        Task<bool> AddOrUpdateRecord(SaleDataModel saleData);

        Task<string[]> GetCountries();

        Task<SalesStatisticsClientModel[]> GetStatistics(string country);
    }

    public class SalesService : ISalesService
    {
        private readonly ApplicationDatabase _database;

        public SalesService(ApplicationDatabase database)
        {
            _database = database;
        }

        public IAsyncEnumerable<SaleDataModel> GetSales(string filter, string sort, int skip, int count)
        {
            var filteredResult = string.IsNullOrEmpty(filter)
                ? _database.Sales
                : _database.Sales.Where(sale => sale.Country.ToLower().Contains(filter.ToLower()));

            if (string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase))
            {
                filteredResult = filteredResult.OrderBy(user => user.OrderDate);
            }
            else if (string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase))
            {
                filteredResult = filteredResult.OrderByDescending(user => user.OrderDate);
            }
            return filteredResult
                .Skip(skip)
                .Take(count).AsAsyncEnumerable();
        }

        public async Task SaveSalesData(SaleDataModel[] sales)
        {
            _database.Sales.AddRange(sales);
            await _database.SaveChangesAsync();
        }

        public async Task<int> GetSalesCount(string filter)
        {
            var filteredResult = string.IsNullOrEmpty(filter)
                ? _database.Sales
                : _database.Sales.Where(sale => sale.Country.ToLower().Contains(filter.ToLower()));

            return await filteredResult.CountAsync();
        }

        public async Task DeleteSales(long[] ids)
        {
            var salesToRemove = await _database.Sales.Where(sale => ids.Contains(sale.OrderId)).ToArrayAsync();
            _database.Sales.RemoveRange(salesToRemove);
            await _database.SaveChangesAsync();
        }

        public async Task<bool> AddOrUpdateRecord(SaleDataModel saleData)
        {
            if (_database.Sales.Any(sale => sale.OrderId == saleData.OrderId))
            {
                _database.Sales.Attach(saleData);
                _database.Entry(saleData).State = EntityState.Modified;
            }
            else
            {
                _database.Sales.Add(saleData);
            }

            var changes = await _database.SaveChangesAsync();

            return changes == 1;
        }

        public async Task<string[]> GetCountries()
        {
            return await _database.Sales.Select(sale => sale.Country).Distinct().ToArrayAsync();
        }

        public async Task<SalesStatisticsClientModel[]> GetStatistics(string country)
        {
            return await _database.Sales
                .Where(sale => sale.Country == country)
                .GroupBy(sale => sale.OrderDate.Year)
                .Select(g => new SalesStatisticsClientModel
                {
                    Year = g.Key,
                    TotalProfit = g.Sum(sale => sale.TotalProfit),
                    TotalSold = g.Sum(sale => sale.UnitsSold)
                })
                .OrderByDescending(sale => sale.Year)
                .ToArrayAsync();
        }

        public async Task SaveSaleData(SaleDataModel saleData)
        {
            _database.Sales.Add(saleData);
            await _database.SaveChangesAsync();
        }
    }
}