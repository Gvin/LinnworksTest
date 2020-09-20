using System;

namespace LinnworksBackend.Model.Views
{
    public class SaleDataViewModel
    {
        public long? OrderId { get; set; }

        public string Region { get; set; }

        public string Country { get; set; }

        public string ItemType { get; set; }

        public string SalesChannel { get; set; }

        public string OrderPriority { get; set; }

        public DateTime OrderDate { get; set; }

        public DateTime ShipDate { get; set; }

        public int UnitsSold { get; set; }

        public string UnitPrice { get; set; }

        public string UnitCost { get; set; }

        public string TotalRevenue { get; set; }

        public string TotalCost { get; set; }

        public string TotalProfit { get; set; }
    }
}