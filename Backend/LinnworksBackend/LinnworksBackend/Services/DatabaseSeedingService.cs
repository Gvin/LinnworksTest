using System;
using System.Linq;
using LinnworksBackend.Data;
using LinnworksBackend.Data.Exceptions;
using LinnworksBackend.Model.Database;
using Microsoft.AspNetCore.Identity;

namespace LinnworksBackend.Services
{
    public interface IDatabaseSeedingService
    {
        void SeedDatabase();
    }

    public class DatabaseSeedingService : IDatabaseSeedingService
    {
        private const string DefaultAdminLogin = "admin";
        private const string DefaultAdminPassword = "root";

        private readonly ApplicationDatabase _database;
        private readonly UserManager<UserModel> _userManager;
        private readonly RoleManager<UserRole> _roleManager;

        public DatabaseSeedingService(
            ApplicationDatabase database, 
            UserManager<UserModel> userManager, 
            RoleManager<UserRole> roleManager)
        {
            _database = database;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public void SeedDatabase()
        {
            EnsureRolesCreated();
            EnsureAdminUserCreated();
        }

        private void EnsureAdminUserCreated()
        {
            var adminUserExists = _database.Users.Any(user =>
                string.Equals(user.UserName, DefaultAdminLogin, StringComparison.OrdinalIgnoreCase));
            if (!adminUserExists)
            {
                var adminUser = new UserModel(DefaultAdminLogin);
                var creationResult = _userManager.CreateAsync(adminUser, DefaultAdminPassword).Result;
                if (!creationResult.Succeeded)
                    throw new DatabaseSeedException(
                        $"Error while trying to create default {DefaultAdminLogin} user: {string.Join("; ", creationResult.Errors)}");

                var roleAssignResult = _userManager.AddToRoleAsync(adminUser, UserRole.AdministratorRole).Result;
                if (!roleAssignResult.Succeeded)
                    throw new DatabaseSeedException(
                        $"Error while trying to assign {UserRole.AdministratorRole} role to {DefaultAdminLogin} user: {string.Join("; ", roleAssignResult.Errors)}");
            }
        }

        private void EnsureRolesCreated()
        {
            EnsureRoleCreated(UserRole.AdministratorRole);
            EnsureRoleCreated(UserRole.ManagerRole);
            EnsureRoleCreated(UserRole.ReaderRole);
        }

        private void EnsureRoleCreated(string roleName)
        {
            var roleExists = _roleManager.RoleExistsAsync(roleName).Result;
            if (!roleExists)
            {
                var roleCreationResult = _roleManager.CreateAsync(new UserRole(roleName)).Result;
                if (!roleCreationResult.Succeeded)
                    throw new DatabaseSeedException(
                        $"Error while trying to create default roles: {string.Join("; ", roleCreationResult.Errors)}");
            }
        }
    }
}