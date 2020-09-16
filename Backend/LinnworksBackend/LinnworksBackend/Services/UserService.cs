using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using LinnworksBackend.Data;
using LinnworksBackend.Model.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LinnworksBackend.Services
{
    public interface IUserService
    {
        UserModel GetCurrentUser();

        Task<OperationResult<UserModel, IdentityError>> CreateUser(string login, string password, string role);

        Task<UserModel> LogIn(string login, string password);

        UserModel[] GetUsers();

        Task<string> GetUserRole(UserModel user);
    }

    public class UserService : IUserService
    {
        private readonly UserManager<UserModel> _userManager;
        private readonly SignInManager<UserModel> _signInManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDatabase _database;

        public UserService(
            ApplicationDatabase database,
            UserManager<UserModel> userManager,
            SignInManager<UserModel> signInManager,
            IHttpContextAccessor httpContextAccessor)
        {
            _database = database;
            _userManager = userManager;
            _signInManager = signInManager;
            _httpContextAccessor = httpContextAccessor;
        }

        public UserModel GetCurrentUser()
        {
            var caller = _httpContextAccessor.HttpContext.User;
            var userClaim = caller.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier);
            if (userClaim == null)
                return null;
            var userId = userClaim.Value;
            return _database.Users.FirstOrDefault(user => user.Id == userId);
        }

        public async Task<OperationResult<UserModel, IdentityError>> CreateUser(string login, string password, string role)
        {
            var user = new UserModel(login);

            var creationResult = await _userManager.CreateAsync(user, password);
            if (!creationResult.Succeeded)
                return new OperationResult<UserModel, IdentityError>(user, creationResult.Errors);

            var assignRoleResult = await _userManager.AddToRoleAsync(user, role);
            return new OperationResult<UserModel, IdentityError>(user, assignRoleResult.Errors);
        }

        public async Task<UserModel> LogIn(string login, string password)
        {
            var result = await _signInManager.PasswordSignInAsync(login, password, false, false);

            if (result.Succeeded)
            {
                return _userManager.Users.SingleOrDefault(r => string.Equals(r.UserName, login));
            }

            return null;
        }

        public UserModel[] GetUsers()
        {
            return _userManager.Users.ToArray();
        }

        public async Task<string> GetUserRole(UserModel user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1)
                throw new ApplicationException($"Several roles detected for user {user.UserName}");

            return roles[0];
        }
    }
}