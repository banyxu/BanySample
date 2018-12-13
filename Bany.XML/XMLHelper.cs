using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

namespace Bany.XML
{
    public class XmlHelper
    {
        private readonly string _xmlPath;
        private readonly XmlDocument _xmlDocument = new XmlDocument();
        protected XmlHelper(string xmlPath)
        {
            _xmlPath = xmlPath;
            _xmlDocument.Load(_xmlPath);
        }

        /// <summary>
        /// 通过路径创建XmlHelper
        /// </summary>
        /// <param name="xmpPath"></param>
        /// <returns></returns>
        public static XmlHelper LoadPath(string xmpPath)
        {
            XmlHelper xmlHelper = new XmlHelper(xmpPath);
            return xmlHelper;
        }

        /// <summary>
        /// 根据xpath获取对应的节点列表
        /// </summary>
        /// <param name="xpath"></param>
        /// <returns></returns>
        public XmlNodeList GetXmlNodeList(string xpath)
        {
            return _xmlDocument.SelectNodes(xpath);
        }

        /// <summary>
        /// 根据xpath获取对应的节点
        /// </summary>
        /// <param name="xpath"></param>
        /// <returns></returns>
        public XmlNode GetXmlNodeByTagName(string tagName)
        {
            var nodeList = _xmlDocument.GetElementsByTagName(tagName);
            if (nodeList.Count > 0)
            {
                return nodeList[0];
            }
            return null;
        }

        public XmlNode GetXmlNode(string xpath)
        {
            return _xmlDocument.SelectSingleNode(xpath);
        }

        public static object Deserialize(Type type, string xml)
        {
            using (StringReader sr = new StringReader(xml))
            {
                XmlSerializer xmldes = new XmlSerializer(type);
                return xmldes.Deserialize(sr);
            }
        }

        /// <summary>
        /// 修改某节点的值并保存
        /// </summary>
        /// <param name="xpath"></param>
        /// <param name="value"></param>
        public void UpdateXml(string xpath, string value)
        {
            var node = _xmlDocument.SelectSingleNode(xpath) as XmlElement;
            if (node == null) return;
            node.InnerText = value;
            _xmlDocument.Save(_xmlPath);
        }

        /// <summary>
        /// 删除节点
        /// </summary>
        /// <param name="xpath"></param>
        public void DeleteNode(string xpath)
        {
            var node = _xmlDocument.SelectSingleNode(xpath);
            if (node == null) return;
            XmlElement root = _xmlDocument.DocumentElement;
            if (root != null) root.RemoveChild(node);
            _xmlDocument.Save(_xmlPath);
        }


        public static void Bytes2File(byte[] buff, string savepath)
        {
            if (System.IO.File.Exists(savepath))
            {
                System.IO.File.Delete(savepath);
            }
            FileStream fs = new FileStream(savepath, FileMode.CreateNew);
            BinaryWriter bw = new BinaryWriter(fs);
            bw.Write(buff, 0, buff.Length);
            bw.Close();
            fs.Close();
        }

        public static void Bytes2File1(byte[] buff, string savepath)
        {
            string strFilePath = @"d:\20181002220206.xml";
            FileStream fs = new FileStream(strFilePath, FileMode.Open);
            BinaryWriter bw = new BinaryWriter(fs);
            bw.Write(buff, 0, buff.Length);
            StreamReader read = new StreamReader(fs);
            string str1 = read.ReadToEnd();
            string str = Encoding.ASCII.GetString(buff);
            bw.Close();
            fs.Close();
        }

    }
}
