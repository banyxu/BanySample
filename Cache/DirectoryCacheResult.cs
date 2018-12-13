using System;
using System.IO;

namespace Cache
{
    /// <summary>
    /// 文件夹缓存结果类
    /// </summary>
    [Serializable]
    public class DirectoryCacheResult
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success
        {
            get;
            set;
        }

        /// <summary>
        /// 错误消息
        /// </summary>
        public string Message
        {
            get;
            set;
        }

        /// <summary>
        /// 开始时间
        /// </summary>
        public DateTime StartDateTime
        {
            get;
            set;
        }

        /// <summary>
        /// 结束时间
        /// </summary>
        public DateTime EndDateTime
        {
            get;
            set;
        }

        /// <summary>
        /// 返回文件类数组
        /// </summary>
        public FileInfo[] FileInfos
        {
            get;
            set;
        }

        /// <summary>
        /// 是否缓存返回
        /// </summary>
        public bool IsCacheReturn
        {
            get;
            set;
        }

        /// <summary>
        /// 缓存主键
        /// </summary>
        public string CacheKey
        {
            get;
            set;
        }

        /// <summary>
        /// 文件夹最后写入时间
        /// </summary>
        public DateTime LastWriteTime
        {
            get;
            set;
        }
    }
}
