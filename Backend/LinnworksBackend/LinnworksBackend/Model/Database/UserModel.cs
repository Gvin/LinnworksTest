using Microsoft.AspNetCore.Identity;

namespace LinnworksBackend.Model.Database
{
    public class UserModel : IdentityUser
    {
        public UserModel()
        {
        }

        public UserModel(string userName) : base(userName)
        {
        }
    }
}