using System.Collections;

namespace Cache.Storage
{
    /// <summary>
    /// 本地HashTable方式缓存
    /// </summary>
    public class StorageHashtable : IStorageBase
    {
        private StorageHashtable()
        {
        }

        private static StorageHashtable _instance = null;
        public static StorageHashtable Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new StorageHashtable();
                }
                return _instance;
            }
        }

        private static readonly Hashtable HtLock = Hashtable.Synchronized(new Hashtable());
        private static readonly Hashtable HtDirectory = Hashtable.Synchronized(new Hashtable());

        public object GetLock(string key)
        {
            key = Cache.Util.MD5Helper.GetMD5HashString(key);
            // 从缓存读取锁对象
            object lockObj = HtLock[key];
            if (lockObj == null)
            {
                HtLock[key] = lockObj = new object();
            }
            return lockObj;
        }

        public T GetCache<T>(string key)
        {
            key = Cache.Util.MD5Helper.GetMD5HashString(key);
            return (T)HtDirectory[key];
        }

        public void SetCache<T>(string key, T value)
        {
            key = Cache.Util.MD5Helper.GetMD5HashString(key);
            HtDirectory[key] = value;
        }

        public static void ClearCache()
        {
            HtLock.Clear();
            HtDirectory.Clear();
        }

        private void ThreadClear()
        {
            if (HtDirectory.Count >= 100)
            {
                ClearCache();
            }
        }
    }
}
