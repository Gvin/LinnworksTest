namespace LinnworksBackend.Data.AsyncJobs
{
    public interface IAsyncJob
    {
        bool Complete { get; }

        void Run();
    }
}