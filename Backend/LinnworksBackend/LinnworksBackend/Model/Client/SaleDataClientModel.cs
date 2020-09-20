namespace LinnworksBackend.Model.Client
{
    public class SaleDataClientModel
    {
        public long OrderId { get; set; }

        public string Region { get; set; }

        public string Country { get; set; }

        public string ItemType { get; set; }

        public string SalesChannel { get; set; }

        public string OrderPriority { get; set; }

        public string OrderDate { get; set; }

        public string ShipDate { get; set; }

        public int UnitsSold { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal UnitCost { get; set; }

        public decimal TotalRevenue { get; set; }

        public decimal TotalCost { get; set; }

        public decimal TotalProfit { get; set; }
    }
}