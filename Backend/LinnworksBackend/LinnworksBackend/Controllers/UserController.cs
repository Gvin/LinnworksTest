using System.Collections.Generic;
using System.Threading.Tasks;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
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

            var role = await _userService.GetUserRole(user);

            return Task.FromResult(_jwtTokenService.GenerateJwtToken(user, role));
        }

        [Authorize(Roles = UserRole.AdministratorRole)]
        [HttpPost("create")]
        public async Task<IActionResult> Create()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var login = Request.Form["login"];
            var password = Request.Form["password"];
            var role = Request.Form["role"];

            var registerResult = await _userService.CreateUser(login, password, role);
            if (registerResult.HasErrors)
            {
                foreach (var error in registerResult.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                    return BadRequest(ModelState);
                }
            }

            return Ok();
        }

        [Authorize(Roles = UserRole.AdministratorRole)]
        [HttpGet("list")]
        public async IAsyncEnumerable<UserClientModel> List()
        {
            var users = _userService.GetUsers();
            foreach(var user in  users)
            {
                var role = await _userService.GetUserRole(user);
                yield return new UserClientModel{Login = user.UserName, Role = role};
            }
        }
    }
}