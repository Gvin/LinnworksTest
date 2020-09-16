using Microsoft.AspNetCore.Mvc;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        [HttpGet("application")]
        public string GetApplicationStatus()
        {
            return "Online";
        }
    }
}