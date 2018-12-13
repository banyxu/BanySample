using System;
using System.Collections;
using Cache.Redis;
using Cache.RedisLock;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace Cache.Storage
{
    public class StorageRedis : IStorageBase
    {
        /// <summary>
        /// 锁对象
        /// </summary>
        private static readonly object Locker = new Object();

        private static readonly Hashtable HtLock = Hashtable.Synchronized(new Hashtable());

        private StorageRedis() { }

        /// <summary>
        /// 单例对象
        /// </summary>
        private static StorageRedis _instance = null;
        /// <summary>
        /// 获取单例实例
        /// </summary>
        public static StorageRedis Instance
        {
            get
            {
                try
                {
                    if (_instance == null)
                    {
                        lock (Locker)
                        {
                            if (_instance == null)
                            {

                                _instance = new StorageRedis();
                            }
                        }
                    }
                    return _instance;
                }
                catch (Exception ex)
                {
                    //FileLog.WriteLog("StorageRedis: Instance,error:" + JsonConvert.SerializeObject(ex));
                    //return null;
                    throw ex;
                }
            }
        }

        /// <summary>
        /// 获取锁对象
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public object GetLock(string key)
        {
            try
            {
                key = Util.MD5Helper.GetMD5HashString(key);
                // 从缓存读取锁对象
                var lockObj = HtLock[key];
                if (lockObj == null)
                {
                    HtLock[key] = lockObj = new object();
                }
                return lockObj;
            }
            catch (Exception ex)
            {
                //FileLog.WriteLog("StorageRedis: GetLock(string key),error:" + JsonConvert.SerializeObject(ex));
                //return null;
                throw ex;
            }
        }

        /// <summary>
        /// 获取缓存（泛型）
        /// </summary>
        /// <param name="key"></param>
        public T GetCache<T>(string key)
        {
            try
            {
                return RedisManager.Get<T>(key);
            }
            catch (Exception ex)
            {
                //FileLog.WriteLog("StorageRedis:Get<T>(string key),error:" + JsonConvert.SerializeObject(ex));
                //return default(T);
                throw ex;
            }
        }

        /// <summary>
        /// 设置缓存
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public void SetCache<T>(string key, T value)
        {
            try
            {
                RedisManager.Set(key, value);
            }
            catch (Exception ex)
            {
                //FileLog.WriteLog("StorageRedis:Set(string key, object value),error:" + JsonConvert.SerializeObject(ex));
                throw ex;
            }
        }

        public void ClearCache()
        {
        }
    }
}
