using System.Security.Cryptography;
using System.Text;

namespace Cache.Util
{
    public class MD5Helper
    {
        private static readonly MD5 Md5 = MD5.Create();

        //使用utf8编码将字符串散列
        public static string GetMD5HashString(string sourceStr)
        {
            return GetMD5HashString(sourceStr, Encoding.UTF8);
        }

        //使用指定编码将字符串散列
        public static string GetMD5HashString(string sourceStr, Encoding encode)
        {
            var sb = new StringBuilder();
            var source = Md5.ComputeHash(encode.GetBytes(sourceStr));
            for (var i = 0; i < source.Length; i++)
            {
                sb.Append(source[i].ToString("x2"));
            }
            return sb.ToString();
        }
    }
}
