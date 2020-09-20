using System.Collections.Generic;
using System.Linq;

namespace LinnworksBackend.Data.AsyncJobs
{
    public interface IAsyncJobsProcessor
    {
        string RegisterAsyncJob(IAsyncJob job);

        T GetJob<T>(string id) where T : class, IAsyncJob;

        void CheckCompleteJobs();
    }

    public class AsyncJobsProcessor : IAsyncJobsProcessor
    {
        private int _jobIdCounter;
        private readonly Dictionary<string, IAsyncJob> _jobs;

        public AsyncJobsProcessor()
        {
            _jobIdCounter = 0;
            _jobs = new Dictionary<string, IAsyncJob>();
        }

        public string RegisterAsyncJob(IAsyncJob job)
        {
            lock (_jobs)
            {
                var jobId = $"id{_jobIdCounter}";
                _jobIdCounter++;

                _jobs.Add(jobId, job);
                job.Run();

                return jobId;
            }
        }

        public T GetJob<T>(string id) where T : class, IAsyncJob
        {
            lock (_jobs)
            {
                if (_jobs.ContainsKey(id))
                {
                    return (T) _jobs[id];
                }

                return null;
            }
        }

        public void CheckCompleteJobs()
        {
            lock (_jobs)
            {
                foreach (var jobKey in _jobs.Keys.ToArray())
                {
                    var job = _jobs[jobKey];
                    if (job.Complete)
                    {
                        _jobs.Remove(jobKey);
                    }
                }
            }
        }
    }
}