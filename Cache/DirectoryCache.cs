using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;
using Cache.Enum;
using Cache.Storage;

namespace Cache
{
    /// <summary>
    /// 文件夹缓存类
    /// </summary>
    public static class DirectoryCache
    {
        // 日志文件，DEBUG模式会记录
        private static string logfilename = string.Format("{0}/Log/DirectoryCache/{1}.log", AppDomain.CurrentDomain.BaseDirectory, DateTime.Now.ToString("yyyyMMdd"));

        #region DirectoryCacheResult GetFileInfos

        /// <summary>
        /// 获取文件夹下文件列表缓存
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="cacheType">缓存方式</param>
        /// <returns>返回文件列表缓存</returns>
        public static DirectoryCacheResult GetFileInfos(string directory, CacheType cacheType = CacheType.Hashtable)
        {
            return GetFileInfos(directory, string.Empty, SearchOption.TopDirectoryOnly, string.Empty, cacheType);
        }
        /// <summary>
        /// 获取文件夹下文件列表缓存
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="cacheType">缓存方式</param>
        /// <returns>返回文件列表缓存</returns>
        public static DirectoryCacheResult GetFileInfos(string directory, string searchPattern, CacheType cacheType = CacheType.Hashtable)
        {
            return GetFileInfos(directory, searchPattern, SearchOption.TopDirectoryOnly, string.Empty, cacheType);
        }
        /// <summary>
        /// 获取文件夹下文件列表缓存
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="searchOption">文件搜索选项</param>
        /// <param name="cacheType">缓存方式</param>
        /// <returns>返回文件列表缓存</returns>
        public static DirectoryCacheResult GetFileInfos(string directory, string searchPattern, SearchOption searchOption, CacheType cacheType = CacheType.Hashtable)
        {
            return GetFileInfos(directory, searchPattern, searchOption, string.Empty, cacheType);
        }
        /// <summary>
        /// 获取文件夹下文件列表缓存
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="searchOption">文件搜索选项</param>
        /// <param name="regexPattern">文件搜索正值表达式</param>
        /// <param name="cacheType">缓存方式</param>
        /// <returns>返回文件列表缓存</returns>
        public static DirectoryCacheResult GetFileInfos(string directory, string searchPattern, SearchOption searchOption, string regexPattern, CacheType cacheType = CacheType.Hashtable)
        {
            if (!Directory.Exists(Path.GetDirectoryName(logfilename)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(logfilename));
            }

            DirectoryCacheResult result = new DirectoryCacheResult();
            // 目录不存在，文件列表返回NULL
            DirectoryInfo directoryInfo = new DirectoryInfo(directory);
            if (!directoryInfo.Exists)
            {
                result.Success = false;
                result.Message = string.Format("文件夹“{0}”不存在!", directory);
                return result;
            }

            result.StartDateTime = DateTime.Now;

            string key = string.Format("DirectoryCache|{0}|{1}|{2}|{3}", directory, searchPattern, searchOption, regexPattern);
            DirectoryInfoEx directoryInfoEx = null;

            // 根据传入缓存方式获取缓存存储对象
            IStorageBase Storage = null;
            if (cacheType == CacheType.Redis)
                Storage = StorageRedis.Instance;
            else
                Storage = StorageHashtable.Instance;

            // 防止目录查询耗时长，此处读取用锁控制只缓存一次
            lock (Storage.GetLock(key))
            {
                try
                {
                    // 是否使用缓存
                    bool UseCache = (cacheType != CacheType.None);
                    // 如果缓存方式不是不缓存枚举，获取缓存对象
                    if (UseCache)
                        directoryInfoEx = Storage.GetCache<DirectoryInfoEx>(key);

                    // 当前目录没有缓存，或者缓存已经过期
                    DateTime DirectoryLastWriteTime = GetLastWriteTime(directoryInfo, searchOption);
                    if (directoryInfoEx == null || directoryInfoEx.LastWriteTime != DirectoryLastWriteTime)
                    {
                        // 通配符为空，设置默认*号查所有文件
                        if (string.IsNullOrEmpty(searchPattern))
                            searchPattern = "*";

                        // 查询目录，并且把返回结果缓存
                        var fileInfos = directoryInfo.GetFiles(searchPattern, searchOption);

                        // 正则表达式通配符有值，根据文件名是否符合正则表达式规则来过滤
                        if (!string.IsNullOrEmpty(regexPattern))
                        {
                            fileInfos = fileInfos.Where(p => Regex.IsMatch(p.Name, regexPattern, RegexOptions.IgnoreCase)).ToArray();
                        }

                        // 查询结果缓存，并返回
                        directoryInfoEx = new DirectoryInfoEx()
                        {
                            CacheKey = key,
                            LastWriteTime = DirectoryLastWriteTime,
                            fileInfos = fileInfos
                        };
                        // 是否使用缓存
                        if (UseCache)
                            Storage.SetCache(key, directoryInfoEx);
                        result.IsCacheReturn = false;
                    }
                    else
                    {
                        result.IsCacheReturn = true;
                    }
                }
                catch (Exception ex)
                {
                    result.Success = false;
                    result.Message = ex.Message;
                }
            }
            result.Success = true;
            result.Message = string.Empty;
            result.EndDateTime = DateTime.Now;
            result.FileInfos = directoryInfoEx.fileInfos;
            result.CacheKey = directoryInfoEx.CacheKey;
            result.LastWriteTime = directoryInfoEx.LastWriteTime;
            result.LastWriteTime = directoryInfoEx.LastWriteTime;

            //#if DEBUG

            File.AppendAllText(logfilename, string.Format("Success={0}, Message={1}, CacheKey={2}, IsCacheReturn={3}, StartDateTime={4:yyyy-MM-dd HH:mm:ss}, EndDateTime={5:yyyy-MM-dd HH:mm:ss}, LastWriteTime={6:yyyy-MM-dd HH:mm:ss}\r\n\r\n",
                result.Success, result.Message, result.CacheKey, result.IsCacheReturn, result.StartDateTime, result.EndDateTime, result.LastWriteTime));

            //#endif

            return result;
        }

        /// <summary>
        /// 获取文件夹最后写入时间
        /// </summary>
        /// <param name="directoryInfo">文件夹最后写入时间</param>
        private static DateTime GetLastWriteTime(DirectoryInfo directoryInfo, SearchOption searchOption)
        {
            DateTime result = directoryInfo.LastWriteTime;
            // 由于子文件夹下文件发送变更，主文件夹写入时间不变，此处查询所有子文件夹最后写入时间，取最大值
            if (searchOption == SearchOption.AllDirectories)
            {
                var dirInfos = directoryInfo.GetDirectories("*", SearchOption.AllDirectories);
                if (dirInfos != null && dirInfos.Length > 0)
                {
                    foreach (var dirInfo in dirInfos)
                    {
                        if (dirInfo.LastWriteTime > result)
                            result = dirInfo.LastWriteTime;
                    }
                }
            }
            return result;
        }
        #endregion DirectoryCacheResult GetFileInfos

        #region T GetFileInfos<T>

        /// <summary>
        /// 获取文件夹下文件列表自定义对象
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="funcKey">委托参数KEY</param>
        /// <param name="searchFunc">委托函数</param>
        /// <param name="cacheType">缓存方式</param>
        /// <param name="cacheOption">缓存选项</param>
        /// <returns>返回文件列表缓存</returns>
        public static T GetFileInfos<T>(string directory, string funcKey, Func<DirectoryCacheResult, T> searchFunc, CacheType cacheType = CacheType.Hashtable, CacheOption cacheOption = CacheOption.All)
        {
            return GetFileInfos(directory, string.Empty, SearchOption.TopDirectoryOnly, string.Empty, funcKey, searchFunc, cacheType, cacheOption);
        }

        /// <summary>
        /// 获取文件夹下文件列表自定义对象
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="funcKey">委托参数KEY</param>
        /// <param name="searchFunc">委托函数</param>
        /// <param name="cacheType">缓存方式</param>
        /// <param name="cacheOption">缓存选项</param>
        /// <returns>返回文件列表缓存</returns>
        public static T GetFileInfos<T>(string directory, string searchPattern, string funcKey, Func<DirectoryCacheResult, T> searchFunc, CacheType cacheType = CacheType.Hashtable, CacheOption cacheOption = CacheOption.All)
        {
            return GetFileInfos(directory, searchPattern, SearchOption.TopDirectoryOnly, string.Empty, funcKey, searchFunc, cacheType, cacheOption);
        }

        /// <summary>
        /// 获取文件夹下文件列表自定义对象
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="searchOption">文件搜索选项</param>
        /// <param name="funcKey">委托参数KEY</param>
        /// <param name="searchFunc">委托函数</param>
        /// <param name="cacheType">缓存方式</param>
        /// <param name="cacheOption">缓存选项</param>
        /// <returns>返回文件列表缓存</returns>
        public static T GetFileInfos<T>(string directory, string searchPattern, SearchOption searchOption, string funcKey, Func<DirectoryCacheResult, T> searchFunc, CacheType cacheType = CacheType.Hashtable, CacheOption cacheOption = CacheOption.All)
        {
            return GetFileInfos(directory, searchPattern, searchOption, string.Empty, funcKey, searchFunc, cacheType, cacheOption);
        }

        /// <summary>
        /// 获取文件夹下文件列表自定义对象
        /// </summary>
        /// <param name="directory">文件夹名称</param>
        /// <param name="searchPattern">文件搜索通配符</param>
        /// <param name="searchOption">文件搜索选项</param>
        /// <param name="regexPattern">文件搜索正值表达式</param>
        /// <param name="funcKey">委托参数KEY</param>
        /// <param name="searchFunc">委托函数</param>
        /// <param name="cacheType">缓存方式</param>
        /// <param name="cacheOption">缓存选项</param>
        /// <returns>返回文件列表缓存</returns>
        public static T GetFileInfos<T>(string directory, string searchPattern, SearchOption searchOption, string regexPattern, string funcKey, Func<DirectoryCacheResult, T> searchFunc, CacheType cacheType = CacheType.Hashtable, CacheOption cacheOption = CacheOption.All)
        {

            /*创建日志目录*/
            if (!Directory.Exists(Path.GetDirectoryName(logfilename)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(logfilename));
            }

            // 只有缓存选项是所有都缓存或一级缓存，才会缓存文件夹通配符搜索的文件列表结果
            DirectoryCacheResult all = GetFileInfos(directory, searchPattern, searchOption, regexPattern,
                (cacheOption == CacheOption.All || cacheOption == CacheOption.SearchFiles) ? cacheType : CacheType.None);

            // 原始缓存结果，为NULL，或者状态失败，返回T默认值
            if (all == null || !all.Success)
                return default(T);

            // 根据参数计算缓存KEY
            string key = string.Format("{0}|{1}", all.CacheKey, funcKey);

            SearchCacheResult searchCacheResult = null;

            // 根据传入缓存方式获取缓存存储对象
            IStorageBase Storage = null;
            if (cacheType == CacheType.Redis)
                Storage = StorageRedis.Instance;
            else
                Storage = StorageHashtable.Instance;
            // 防止查询耗时长，此处读取用锁控制只缓存一次
            lock (Storage.GetLock(key))
            {
                bool UseCache = (cacheType != CacheType.None) && (cacheOption == CacheOption.All || cacheOption == CacheOption.DelegateResult);
                // 缓存方式不等于不缓存，缓存选项
                if (UseCache)
                    searchCacheResult = Storage.GetCache<SearchCacheResult>(key);
                // 当前目录没有缓存，或者缓存已经过期
                if (searchCacheResult == null || searchCacheResult.LastWriteTime != all.LastWriteTime)
                {
                    // 查询结果缓存，并返回
                    searchCacheResult = new SearchCacheResult()
                    {
                        CacheKey = key,
                        LastWriteTime = all.LastWriteTime,
                        // 调用外部委托方法
                        result = searchFunc(all)
                    };
                    if (UseCache)
                        Storage.SetCache(key, searchCacheResult);

                    //#if DEBUG
                    // DEBUG模式记录日志
                    File.AppendAllText(logfilename, string.Format("CacheKey={0}, IsCacheReturn={1}, LastWriteTime={2:yyyy-MM-dd HH:mm:ss}\r\n\r\n",
                        key, false, searchCacheResult.LastWriteTime));

                    //#endif
                }
                else
                {
                    //#if DEBUG
                    // DEBUG模式记录日志
                    File.AppendAllText(logfilename, string.Format("CacheKey={0}, IsCacheReturn={1}, LastWriteTime={2:yyyy-MM-dd HH:mm:ss}\r\n\r\n",
                        key, true, searchCacheResult.LastWriteTime));

                    //#endif
                }
            }

            return (T)searchCacheResult.result;
        }

        #endregion T GetFileInfos<T>
    }

    [Serializable]
    class DirectoryInfoEx
    {
        public string CacheKey
        {
            get;
            set;
        }

        public DateTime LastWriteTime
        {
            get;
            set;
        }
        public FileInfo[] fileInfos
        {
            get;
            set;
        }
    }

    [Serializable]
    class SearchCacheResult
    {
        public string CacheKey
        {
            get;
            set;
        }
        public DateTime LastWriteTime
        {
            get;
            set;
        }
        public object result
        {
            get;
            set;
        }
    }
}
