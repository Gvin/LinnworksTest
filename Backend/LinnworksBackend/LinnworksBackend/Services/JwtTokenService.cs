using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LinnworksBackend.Model.Database;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LinnworksBackend.Services
{
    public interface IJwtTokenService
    {
        string GenerateJwtToken(UserModel user, string role);
    }

    public class JwtTokenService : IJwtTokenService
    {
        private const string ParameterKey = "JwtKey";
        private const string ParameterExpireDays = "JwtExpireDays";
        private const string ParameterIssuer = "JwtIssuer";

        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            this._configuration = configuration;
        }

        public string GenerateJwtToken(UserModel user, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration[ParameterKey]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration[ParameterExpireDays]));

            var token = new JwtSecurityToken(
                _configuration[ParameterIssuer],
                _configuration[ParameterIssuer],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}