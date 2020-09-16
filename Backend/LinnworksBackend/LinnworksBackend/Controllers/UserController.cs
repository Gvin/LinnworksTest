using System.Collections.Generic;
using System.Threading.Tasks;
using LinnworksBackend.Model.Client;
using LinnworksBackend.Model.Database;
using LinnworksBackend.Model.Views;
using LinnworksBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;

namespace LinnworksBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private const string ErrorKeyInvalidRole = "invalid-role";
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

            if (!UserRole.GetIfRoleExists(role))
            {
                ModelState.TryAddModelError(ErrorKeyInvalidRole, $"Invalid role: {role}");
                return BadRequest(ModelState);
            }

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
                yield return new UserClientModel{Id = user.Id, Login = user.UserName, Role = role};
            }
        }

        [Authorize(Roles = UserRole.AdministratorRole)]
        [HttpPost("delete")]
        public async Task<IActionResult> Delete()
        {
            var userId = Request.Form["userId"];
            await _userService.DeleteUserById(userId);
            return Ok(true);
        }

        [Authorize(Roles = UserRole.AdministratorRole)]
        [HttpPost("update")]
        public async Task<IActionResult> Update()
        {
            var userId = Request.Form["userId"];
            var login = Request.Form["login"];
            var role = Request.Form["role"];

            await _userService.UpdateUser(userId, login, role);
            return Ok(true);
        }
    }
}