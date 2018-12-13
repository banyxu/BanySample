using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSharp
{
    public class FileReader
    {
        public void ReadFile(string fileName, bool refFlag = true)
        {
            using (Stream stream = new FileStream(fileName, FileMode.Open))
            {
                using (BinaryReader reader = new BinaryReader(stream, Encoding.Default))
                {
                    int num;
                    this.ZoneName = this.ByteArrayToString(reader.ReadBytes(12));
                    this.DataName = this.ByteArrayToString(reader.ReadBytes(38));
                    this.Flag = this.ByteArrayToString(reader.ReadBytes(8));
                    this.Version = this.ByteArrayToString(reader.ReadBytes(8));
                    this.Year = reader.ReadUInt16();
                    this.Month = reader.ReadUInt16();
                    this.Day = reader.ReadUInt16();
                    this.Hour = reader.ReadUInt16();
                    this.Minute = reader.ReadUInt16();
                }
            }
        }

        private string ByteArrayToString(byte[] bArray)
        {
            char[] trimChars = new char[3];
            trimChars[0] = ' ';
            trimChars[2] = '\t';
            string str = Encoding.Default.GetString(bArray);
            return str.Trim(trimChars);
        }
    }
}
