using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using LinnworksBackend.Data;
using LinnworksBackend.Model.Database;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace LinnworksBackend.Services
{
    public interface IUserService
    {
        UserModel GetCurrentUser();

        Task<OperationResult<UserModel, IdentityError>> Register(string login, string password);

        Task<UserModel> LogIn(string login, string password);
    }

    public class UserService : IUserService
    {
        private readonly UserManager<UserModel> _userManager;
        private readonly SignInManager<UserModel> _signInManager;
        private readonly ClaimsPrincipal _caller;
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
            _caller = httpContextAccessor.HttpContext.User;
        }

        public UserModel GetCurrentUser()
        {
            var userClaim = _caller.Claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier);
            if (userClaim == null)
                return null;
            var userId = userClaim.Value;
            return _database.Users.FirstOrDefault(user => user.Id == userId);
        }

        public async Task<OperationResult<UserModel, IdentityError>> Register(string login, string password)
        {
            var user = new UserModel(login);
            var result = await _userManager.CreateAsync(user, password);
            return new OperationResult<UserModel, IdentityError>(user, result.Errors);
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
    }
}