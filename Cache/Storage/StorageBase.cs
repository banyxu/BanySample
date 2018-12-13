using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cache
{
    /// <summary>
    /// 缓存抽象类
    /// </summary>
    public abstract class StorageBase
    {
        /// <summary>
        /// 根据主键获取锁对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <returns>返回锁对象</returns>
        public abstract object GetLock(string key);

        /// <summary>
        /// 根据主键获取缓存对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <returns>返回缓存对象</returns>
        public abstract T GetCache<T>(string key);

        /// <summary>
        /// 保存缓存对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <param name="value">缓存对象数据</param>
        public abstract void SetCache<T>(string key, T value);
    }
}
