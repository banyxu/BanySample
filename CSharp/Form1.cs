using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CSharp
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void btAccessShareFile_Click(object sender, EventArgs e)
        {
            try
            {
                string strDir = @"\\192.168.31.25\Product2\IMAGE01_RADAR";
                string dirUserName = "administroator";
                string dirPasword = "top1234!";
                using (IdentityScope iss = new IdentityScope(dirUserName, dirPasword, strDir))
                {
                    var fileFilter = new HashSet<string> { ".png", ".jpg", ".gif" };
                    if (Directory.Exists(strDir))
                    {
                        DirectoryInfo dInfo = new DirectoryInfo(strDir);
                        FileInfo[] files = dInfo.GetFiles().Where(t => fileFilter.Contains(t.Extension, StringComparer.OrdinalIgnoreCase)).ToArray();
                    }
                }
            }
            catch (Exception ex)
            {
            }
        }
    }
}
