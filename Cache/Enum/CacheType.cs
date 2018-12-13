namespace Cache.Enum
{
    /// <summary>
    /// 缓存方式
    /// </summary>
    public enum CacheType
    {
        /// <summary>
        /// 不缓存
        /// </summary>
        None = 0,

        /// <summary>
        /// 本地Hashtable方式缓存
        /// </summary>
        Hashtable = 1,

        /// <summary>
        /// Redis方式缓存
        /// </summary>
        Redis = 2
    }
}
