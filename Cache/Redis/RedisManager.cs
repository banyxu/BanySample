namespace Cache.Redis
{
    public static class RedisManager
    {
        /// <summary>
        /// redis写对象
        /// </summary>
        private static readonly RedisWriter RedisWriter;

        /// <summary>
        /// redis读对象
        /// </summary>
        private static readonly RedisReader RedisReader;

        static RedisManager()
        {
            RedisWriter = new RedisWriter();
            RedisReader = new RedisReader();
        }

        /// <summary>
        /// 根据key获取缓存对象
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="key"></param>
        /// <returns></returns>
        public static T Get<T>(string key)
        {
            return RedisReader.Get<T>(key);
        }

        /// <summary>
        /// 设置缓存
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void Set(string key, object value)
        {
            RedisWriter.Set(key, value);
        }
    }
}
