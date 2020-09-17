using System;
using Microsoft.AspNetCore.Identity;

namespace LinnworksBackend.Model.Database
{
    public class UserRole : IdentityRole
    {
        public const string AdministratorRole = "Administrator";
        public const string ManagerRole = "Manager";
        public const string ReaderRole = "Reader";

        public const string RolesCanViewSales = AdministratorRole + "," + ManagerRole + "," + ReaderRole;
        public const string RolesCanEditSales = AdministratorRole + "," + ManagerRole;

        public UserRole()
        {
        }

        public UserRole(string roleName) : base(roleName)
        {
        }

        public static bool GetIfRoleExists(string role)
        {
            return string.Equals(role, AdministratorRole, StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(role, ManagerRole, StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(role, ReaderRole);
        }
    }
}