namespace Cache.Storage
{
    /// <summary>
    /// 缓存抽象类
    /// </summary>
    public interface IStorageBase
    {
        /// <summary>
        /// 根据主键获取锁对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <returns>返回锁对象</returns>
         object GetLock(string key);

        /// <summary>
        /// 根据主键获取缓存对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <returns>返回缓存对象</returns>
        T GetCache<T>(string key);

        /// <summary>
        /// 保存缓存对象
        /// </summary>
        /// <param name="key">主键</param>
        /// <param name="value">缓存对象数据</param>
        void SetCache<T>(string key, T value);
    }
}
