using System.Collections.Generic;
using System.Linq;

namespace LinnworksBackend.Data
{
    public class OperationResult<TData, TError> where TData : class
    {
        public OperationResult(TData data, IEnumerable<TError> errors)
        {
            Data = data;
            if (errors != null)
            {
                Errors = errors.ToArray();
            }
        }

        public TData Data { get; private set; }

        public TError[] Errors { get; private set; }

        public bool HasErrors
        {
            get { return Errors != null && Errors.Length > 0; }
        }
    }
}