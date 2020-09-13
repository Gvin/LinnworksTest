using System.Threading.Tasks;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private const string ErrorKeyUnableToLogIn = "invalid-user-or-password";

        private readonly IUserService _userService;
        private readonly IJwtTokenService _jwtTokenService;

        public UserController(IUserService userService, IJwtTokenService jwtTokenService)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public async Task<object> LogIn([FromBody] CredentialsViewModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.LogIn(credentials.Login, credentials.Password);
            if (user == null)
            {
                ModelState.AddModelError(ErrorKeyUnableToLogIn, string.Empty);
                return BadRequest(ModelState);
            }

            return Task.FromResult(_jwtTokenService.GenerateJwtToken(user));
        }

        [HttpPost("register")]
        public async Task<object> Register()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var login = Request.Form["login"];
            var password = Request.Form["password"];

            var registerResult = await _userService.Register(login, password);
            if (registerResult.HasErrors)
            {
                foreach (var error in registerResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                    return BadRequest(ModelState);
                }
            }

            var user = await _userService.LogIn(login, password);

            return Task.FromResult(_jwtTokenService.GenerateJwtToken(user));
        }
    }
}