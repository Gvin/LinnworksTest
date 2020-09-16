using LinnworksBackend.Model.Database;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LinnworksBackend.Data
{
    public class ApplicationDatabase : IdentityDbContext<UserModel, UserRole, string>
    {
        public ApplicationDatabase(DbContextOptions options) 
            : base(options)
        {
        }
    }
}