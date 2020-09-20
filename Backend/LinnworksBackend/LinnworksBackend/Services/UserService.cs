using System;
using System.Linq;
using System.Threading.Tasks;
using LinnworksBackend.Data;
using LinnworksBackend.Model.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LinnworksBackend.Services
{
    public interface IUserService
    {
        Task<OperationResult<UserModel, IdentityError>> CreateUser(string login, string password, string role);

        Task<UserModel> LogIn(string login, string password);

        Task<UserModel[]> GetUsers(string filter, string sort, int startIndex, int count);

        Task<int> GetUsersCount(string filter);

        Task<string> GetUserRole(UserModel user);

        Task DeleteUserById(string userId);

        Task UpdateUser(string userId, string login, string role);
    }

    public class UserService : IUserService
    {
        private readonly UserManager<UserModel> _userManager;
        private readonly SignInManager<UserModel> _signInManager;

        public UserService(
            UserManager<UserModel> userManager,
            SignInManager<UserModel> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
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

        public async Task<UserModel[]> GetUsers(string filter, string sort, int startIndex, int count)
        {
            var filteredResult = string.IsNullOrEmpty(filter) ? 
                _userManager.Users : 
                _userManager.Users.Where(user => user.UserName.ToLower().Contains(filter.ToLower()));

            if (string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase))
            {
                filteredResult = filteredResult.OrderBy(user => user.UserName);
            }
            else if (string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase))
            {
                filteredResult = filteredResult.OrderByDescending(user => user.UserName);
            }

            return await filteredResult.Skip(startIndex).Take(count).ToArrayAsync();
        }

        public async Task<int> GetUsersCount(string filter)
        {
            if (string.IsNullOrEmpty(filter))
                return await _userManager.Users.CountAsync();

            return await _userManager.Users.Where(user => user.UserName.ToLower().Contains(filter.ToLower()))
                .CountAsync();
        }

        public async Task<string> GetUserRole(UserModel user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1)
                throw new ApplicationException($"Several roles detected for user {user.UserName}");

            return roles[0];
        }

        public async Task DeleteUserById(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                throw new ApplicationException($"Unable to delete user {user.UserName}: {string.Join("; ", result.Errors)}");
        }

        public async Task UpdateUser(string userId, string login, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            var currentRole = await GetUserRole(user);

            if (!string.Equals(user.UserName, login))
            {
                user.UserName = login;
                var loginUpdateResult = await _userManager.UpdateAsync(user);
                if (!loginUpdateResult.Succeeded)
                    throw new ApplicationException($"Unable to update user login {user.UserName}: {string.Join("; ", loginUpdateResult.Errors)}");
                
            }

            if (!string.Equals(currentRole, role))
            {
                var roleRemoveResult = await _userManager.RemoveFromRoleAsync(user, currentRole);
                if (!roleRemoveResult.Succeeded)
                    throw new ApplicationException($"Unable to remove current role from user: {string.Join("; ", roleRemoveResult.Errors)}");

                var roleUpdateResult = await _userManager.AddToRoleAsync(user, role);
                if (!roleUpdateResult.Succeeded)
                    throw new ApplicationException($"Unable to assign new role {role} to user: {string.Join("; ",roleUpdateResult.Errors)}");
            }
        }
    }
}