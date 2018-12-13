using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Microsoft.Office.Interop.Word;

namespace Bany.Office.WordOP
{
    public class WordHelper
    {
        private Object nothing = System.Reflection.Missing.Value;
        private _Application _wordApp;
        private _Document _wordDoc;
        private object _saveChanges;//是否保存
        private object _index;//书签名
        private object _pathFile;//文件路径
        public bool SaveToWorld(string title, string imageLocation, string content)
        {
            try
            {
                string strTemplateFile = @"D:\bany\夏士安\震情信息.doc";
                string strFilePath = @"D:\bany\夏士安\File";
                string strFileName = Path.Combine(strFilePath, "震情信息" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".doc");
                object oFileName = strFileName;
                try
                {
                    if (Directory.Exists(strFilePath) == false)
                    {
                        Directory.CreateDirectory(strFilePath);
                    }
                    if (File.Exists(strFileName))
                    {
                        File.Delete(strFileName);
                    }
                    File.Copy(strTemplateFile, strFileName, true);
                }
                catch (Exception)
                {
                    return false;
                }
                _wordApp = new ApplicationClass();
                object readOnly = false;
                object isVisible = false;
                _wordDoc = _wordApp.Documents.Open(ref oFileName, ref nothing,
                                                   ref readOnly, ref nothing,
                                                   ref nothing, ref nothing,
                                                   ref nothing, ref nothing,
                                                   ref nothing, ref nothing,
                                                   ref nothing, ref isVisible,
                                                   ref nothing, ref nothing,
                                                   ref nothing, ref nothing);
                _wordDoc.Activate();


                object _index = "title";

                Bookmark bmTitle = _wordDoc.Bookmarks.get_Item(ref _index);
                bmTitle.Select();
                bmTitle.Range.Font.Name = "宋体";
                bmTitle.Range.Font.Size = 16;
                bmTitle.Range.Text = title;
                bmTitle.Delete();

                object oimage = "image";
                Object LinkToFile = false;
                Object savewithDocument = true;
                object rangs = _wordApp.ActiveDocument.Bookmarks.get_Item(ref oimage).Range;
                _wordDoc.InlineShapes.AddPicture(imageLocation, ref LinkToFile, ref savewithDocument, ref rangs);
                _wordDoc.Application.ActiveDocument.InlineShapes[1].Width = 420;
                _wordDoc.Application.ActiveDocument.InlineShapes[1].Height = 200;

                _index = "content";
                Bookmark bmContent = _wordDoc.Bookmarks.get_Item(ref _index);
                bmContent.Select();
                bmContent.Range.Font.Name = "楷体";
                bmContent.Range.Text = content;
                bmContent.Delete();

                #region 保存word文档
                _saveChanges = true;
                _wordDoc.Close(ref _saveChanges, ref nothing, ref nothing);
                _wordApp.Quit(ref nothing, ref nothing, ref nothing);
                _wordDoc = null;
                _wordApp = null;
                #endregion

            }
            catch (Exception ex)
            {
                return false;
            }
            finally
            {

            }

            return true;
        }

        /// <summary>
        /// 打开word文档
        /// </summary>
        /// <param name="fileName"></param>
        public void OpenFile(string fileName)
        {
            _wordApp = new ApplicationClass();
            _pathFile = fileName;
            object readOnly = false;
            object isVisible = true;
            _wordDoc = _wordApp.Documents.Open(ref _pathFile, ref nothing,
            ref readOnly, ref nothing,
            ref nothing, ref nothing,
            ref nothing, ref nothing,
            ref nothing, ref nothing,
            ref nothing, ref isVisible,
            ref nothing, ref nothing,
            ref nothing, ref nothing);

            _wordDoc.Activate();

        }

        /// <summary>
        /// 打印word
        /// </summary>
        /// <param name="filepath">word文件路径</param>
        /// <param name="printername">指定的打印机</param>
        public static void PrintMethodOther(string filepath, string printername)
        {
            //filepath=@"d:\b.doc";
            //printername = "Microsoft XPS Document Writer";
            try
            {
                System.Diagnostics.Process p = new System.Diagnostics.Process();
                //不现实调用程序窗口,但是对于某些应用无效
                p.StartInfo.CreateNoWindow = false;
                p.StartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Normal;

                //采用操作系统自动识别的模式
                p.StartInfo.UseShellExecute = true;

                //要打印的文件路径
                p.StartInfo.FileName = filepath;
                //Help help = new Help();
                //help.LogMessage(filepath + "---------" + printername);
                //指定执行的动作，是打印，即print，打开是 open
                p.StartInfo.Verb = "print";

                //获取当前默认打印机

                //string defaultPrinter = GetDefaultPrinter();

                ////将指定的打印机设为默认打印机
                //SetDefaultPrinter(printername);

                //开始打印
                p.Start();

                //等待十秒
                p.WaitForExit(10000);

                ////将默认打印机还原
                //SetDefaultPrinter(defaultPrinter);
            }
            catch (Exception ex)
            {

                //help.LogMessage(filepath + "----" + printername + "-------" + ex.Message);
            }

        }
        ///打印页面不会闪动
        public static void PrintWord(string filepath, string printername)
        {
            Document doc = null;
            Microsoft.Office.Interop.Word.Application appWord = null;
            object oMissing = Missing.Value;
            object doNotSaveChanges = WdSaveOptions.wdDoNotSaveChanges;
            try
            {
                object wordFile = filepath;
                //@"d:\b.doc";
                //自定义object类型的布尔值
                object oTrue = false;
                object oFalse = false;

                //定义WORD Application相关

                appWord = new Microsoft.Office.Interop.Word.Application();

                //WORD程序不可见
                appWord.Visible = false;
                //不弹出警告框
                appWord.DisplayAlerts = WdAlertLevel.wdAlertsNone;

                //先保存默认的打印机
                string defaultPrinter = appWord.ActivePrinter;

                //打开要打印的文件
                //如果在其它函数调用中出错（doc为null),处理办法：建立临时文件夹，还要设置服务的权限属性
                doc = appWord.Documents.Open(
                       ref wordFile,
                       ref oMissing,
                       ref oTrue,
                       ref oFalse,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing,
                       ref oMissing);

                //设置指定的打印机
                if (!string.IsNullOrEmpty(printername))
                {
                    appWord.ActivePrinter = printername;
                    //"Microsoft XPS Document Writer";
                }

                //打印

                doc.PrintOut(
                    ref oTrue, //此处为true,表示后台打印
                    ref oFalse,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing,
                    ref oMissing
                    );

                //打印完关闭WORD文件
                doc.Close(ref doNotSaveChanges, ref oMissing, ref oMissing);

                //还原原来的默认打印机
                appWord.ActivePrinter = defaultPrinter;

                //退出WORD程序
                appWord.Quit(ref oMissing, ref oMissing, ref oMissing);

                doc = null;
                appWord = null;
            }
            catch (Exception ex)
            {
               // MessageBox.Show(ex.Message);
            }
            //销毁word进程
            finally
            {
                if (doc != null)
                    doc.Close(ref doNotSaveChanges, ref oMissing, ref oMissing);
                if (appWord != null)
                    appWord.Quit(ref oMissing, ref oMissing, ref oMissing);
            }
        }

        public static bool CreateWord(string context, string fullPath)
        {
            ApplicationClass word = null;
            Document doc = null;
            object nothing = Missing.Value;
            try
            {
                word = new ApplicationClass();
                doc = word.Documents.Add(ref nothing, ref nothing, ref nothing, ref nothing);
                doc.Paragraphs.Last.Range.Text = context;
                object myfileName = fullPath;
                if (File.Exists((string)fullPath))
                    File.Delete((string)fullPath);
                //将WordDoc文档对象的内容保存为doc文档
                doc.SaveAs(ref myfileName, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing, ref nothing);
                //关闭WordDoc文档对象
                doc.Close(ref nothing, ref nothing, ref nothing);
                //关闭WordApp组件对象
                word.Quit(ref nothing, ref nothing, ref nothing);
                return true;
            }
            catch (System.Exception ex)
            {
                //关闭WordDoc文档对象
                if (doc != null) doc.Close(ref nothing, ref nothing, ref nothing);
                //关闭WordApp组件对象
                if (word != null) word.Quit(ref nothing, ref nothing, ref nothing);
                return false;
            }
        }
    }
}
