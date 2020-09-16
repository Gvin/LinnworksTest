using System;

namespace LinnworksBackend.Data.Exceptions
{
    public class DatabaseSeedException : Exception
    {
        public DatabaseSeedException(string message) : base(message)
        {
        }
    }
}