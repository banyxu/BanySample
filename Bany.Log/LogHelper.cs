using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace Bany.Log
{
    public class LogHelper
    {
        #region 字段
        public static object _lock = new object();
        public static string path = "D:\\log";
        public static int fileSize = 10 * 1024 * 1024; //日志分隔文件大小
        private static ConcurrentQueue<Tuple<string, string>> msgQueue = new ConcurrentQueue<Tuple<string, string>>();
        #endregion

        #region 静态构造函数
        static LogHelper()
        {
            Thread thread = new Thread(new ThreadStart(() =>
            {
                try
                {
                    int i;
                    Dictionary<string, List<string>> list;
                    Tuple<string, string> tuple;

                    while (true)
                    {
                        i = 0;
                        list = new Dictionary<string, List<string>>();
                        while (msgQueue.TryDequeue(out tuple) && i++ < 10000)
                        {
                            string source = "";
                            if (tuple.Item1.Contains("EEW"))
                            {
                                source = "EEW";
                            }
                            else if (tuple.Item1.Contains("AU"))
                            {
                                source = "AU";
                            }
                            else if (tuple.Item1.Contains("CCCD"))
                            {
                                source = "CCCD";
                            }
                            if (!list.ContainsKey(source))
                            {
                                list.Add(source, new List<string>() { tuple.Item1 + tuple.Item2 });
                            }
                            else
                            {
                                list[source].Add(tuple.Item1 + tuple.Item2);
                            }
                        }

                        if (list.Count > 0)
                        {
                            foreach (string kv in list.Keys)
                            {
                                WriteFile(list[kv], CreateLogPath(kv));
                            }
                        }

                        Thread.Sleep(1);
                    }
                }
                catch
                {

                }
            }));
            thread.IsBackground = true;
            thread.Start();
        }
        #endregion

        #region 写文件
        /// <summary>
        /// 写文件
        /// </summary>
        public static void WriteFile(List<string> list, string path)
        {
            try
            {
                if (!Directory.Exists(Path.GetDirectoryName(path)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(path));
                }

                if (!File.Exists(path))
                {
                    using (FileStream fs = new FileStream(path, FileMode.Create)) { fs.Close(); }
                }

                using (FileStream fs = new FileStream(path, FileMode.Append, FileAccess.Write))
                {
                    using (StreamWriter sw = new StreamWriter(fs))
                    {
                        list.ForEach(item =>
                        {
                            #region 日志内容
                            string value = string.Format(@"{0} {1}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"), item);
                            #endregion

                            sw.WriteLine(value);
                        });

                        sw.Flush();
                    }
                    fs.Close();
                }
            }
            catch { }
        }
        #endregion

        #region 生成日志文件路径
        /// <summary>
        /// 生成日志文件路径
        /// </summary>
        public static string CreateLogPath(string source)
        {
            int index = 0;
            string logPath;
            bool bl = true;
            do
            {
                index++;
                logPath = Path.Combine(path, source, "Log" + DateTime.Now.ToString("yyyyMMdd") + (index == 1 ? "" : "_" + index.ToString()) + ".txt");
                if (File.Exists(logPath))
                {
                    FileInfo fileInfo = new FileInfo(logPath);
                    if (fileInfo.Length < fileSize)
                    {
                        bl = false;
                    }
                }
                else
                {
                    bl = false;
                }
            } while (bl);

            return logPath;
        }
        #endregion

        #region 写错误日志
        /// <summary>
        /// 写错误日志
        /// </summary>
        public static void LogError(string source, string log)
        {
            msgQueue.Enqueue(new Tuple<string, string>(source + "[Error] ", log));
        }

        public static void LogError(string log)
        {
            LogError("system", log);
        }
        #endregion

        #region 写操作日志
        /// <summary>
        /// 写操作日志
        /// </summary>
        public static void Log(string source, string log)
        {
            msgQueue.Enqueue(new Tuple<string, string>(source + "[Info]  ", log));
        }
        public static void Log(string log)
        {
            Log("system", log);
        }
        #endregion
    }
}
