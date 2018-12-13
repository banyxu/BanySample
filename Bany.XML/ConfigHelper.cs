using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Xml;
using Bany.Log;

namespace Bany.XML
{
    public class ConfigHelp
    {
        /// <summary>
        /// 设置 config 的值 如果不存在key 则新增一个key
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void SetValue(string key, string value)
        {
            Configuration config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            if (!ConfigurationManager.AppSettings.AllKeys.Contains(key))
            {
                config.AppSettings.Settings.Add(key, value);
                config.Save(ConfigurationSaveMode.Modified);
            }
            else
            {
                ConfigurationManager.AppSettings[key] = value;
            }
            ConfigurationManager.RefreshSection("appSettings");
        }


        /// <summary>
        /// 更新AppConfig 如果没有这个值则新增这个节点
        /// </summary>
        /// <param name="appKey"></param>
        /// <param name="newVal"></param>
        public static void UpdateAppsettings(string appKey, string newVal)
        {
            var path = Application.StartupPath + "\\MainClient.exe.config";
            var xDoc = new XmlDocument();
            try
            {
                //获得配置文件的全路径
                var strFileName = path;
                xDoc.Load(strFileName);
                var xNode = xDoc.SelectSingleNode("//appSettings");
                var xElem = (XmlElement)xNode.SelectSingleNode("//add[@key='" + appKey + "']");
                if (xElem != null)
                    xElem.SetAttribute("value", newVal);
                else
                {
                    XmlElement elment = xDoc.CreateElement("add");
                    elment.SetAttribute("key", appKey);
                    elment.SetAttribute("value", newVal);
                    xNode.AppendChild(elment);
                }
                xDoc.Save(strFileName);
                ConfigurationManager.RefreshSection("appSettings");
            }
            catch (Exception excp)
            {
                LogHelper.LogError("保存参数配置时，发生错误\r\n" + excp.Message);
                throw new Exception(excp.Message);
            }
        }

        /// <summary>
        ///  更新配置项
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void UpdateAppSettings(string key, string value)
        {
            Configuration config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            if (ConfigurationManager.AppSettings.AllKeys.Contains(key)) config.AppSettings.Settings.Remove(key);
            config.AppSettings.Settings.Add(key, value);
            config.Save(ConfigurationSaveMode.Modified);
            ConfigurationManager.RefreshSection("appSettings");
        }

        /// <summary>
        ///  获取配置项
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static string GetConfigString(string key)
        {
            return ConfigurationManager.AppSettings.Get(key);
        }
        /// <summary>
        ///  获取配置 如果为空返回默认值
        /// </summary>
        /// <param name="key"></param>
        /// <param name="defaultValue"></param>
        /// <returns></returns>
        public static string GetConfigString(string key, string defaultValue)
        {
            string value = ConfigurationManager.AppSettings.Get(key);
            if (string.IsNullOrEmpty(value))
                return defaultValue;
            return value;
        }
        /// <summary>
        /// 从配置中指定键关联的值
        /// </summary>
        /// <param name="key"></param>
        /// <param name="defaultValue"></param>
        /// <returns></returns>
        public static int GetConfigInt(string key, int defaultValue = 0)
        {
            var value = ConfigurationManager.AppSettings.Get(key);
            int result;
            if (!int.TryParse(value, out result)) result = defaultValue;
            return result;
        }

        /// <summary>
        /// 从配置中指定键关联的值
        /// </summary>
        /// <param name="key"></param>
        /// <param name="defaultValue"></param>
        /// <returns></returns>
        public static bool GetConfigBool(string key, bool defaultValue = false)
        {
            var value = ConfigurationManager.AppSettings.Get(key);
            bool result;
            if (!bool.TryParse(value, out result)) result = defaultValue;
            return result;
        }

        /// <summary>
        /// 从配置中指定键关联的值
        /// </summary>
        /// <param name="key"></param>
        /// <param name="defaultValue"></param>
        /// <returns></returns>
        public static decimal GetConfigDecimal(string key, decimal defaultValue = 0)
        {
            var value = ConfigurationManager.AppSettings.Get(key);
            decimal result;
            if (!decimal.TryParse(value, out result)) result = defaultValue;
            return result;
        }
    }
}
