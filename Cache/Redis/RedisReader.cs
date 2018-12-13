using System;
using System.Configuration;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace Cache.Redis
{
    /// <summary>
    /// 负责Redis读缓存
    /// </summary>
    public class RedisReader : RedisBase
    {
        public RedisReader()
        {
            Coonstr = ConfigurationManager.AppSettings["RedisReaderConnStr"];
            GetInstance().ConnectionFailed += MuxerConnectionFailed;
        }
        /// <summary>
        /// 连接失败，启用主服务连接
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        public new void MuxerConnectionFailed(object sender, ConnectionFailedEventArgs e)
        {
            try
            {
                Coonstr = ConfigurationManager.AppSettings["RedisWriterConnStr"];
                GetInstance();
            }
            catch (Exception ex)
            {
                //FileLog.WriteLog("RedisReader:MuxerConnectionFailed,error:" + JsonConvert.SerializeObject(ex));
                throw ex;
            }
        }
    }
}
