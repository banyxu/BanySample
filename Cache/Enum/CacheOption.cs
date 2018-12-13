namespace Cache.Enum
{
    /// <summary>
    /// 缓存选项
    /// </summary>
    public enum CacheOption
    {
        /// <summary>
        /// 不缓存
        /// </summary>
        None = 0,

        /// <summary>
        /// 文件夹文件匹配缓存(一级缓存)
        /// </summary>
        SearchFiles = 1,

        /// <summary>
        /// 委托函数结果缓存(二级缓存)
        /// </summary>
        DelegateResult = 2,

        /// <summary>
        /// 所有都缓存
        /// </summary>
        All = 4
    }
}
