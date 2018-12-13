using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Windows.Forms;
using System.Xml.Serialization;

namespace Bany.Serialize.Test
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void btnBinarySerialize_Click(object sender, EventArgs e)
        {
            Person person = new Person();

            person.age = 18;

            person.name = "tom";

            person.secret = "i will not tell you";

            FileStream stream = new FileStream(@"c:\temp\person.dat", FileMode.Create);

            BinaryFormatter bFormat = new  BinaryFormatter();

            bFormat.Serialize(stream, person);

            stream.Close();
        }

        private void btnBinaeryDeSerialize_Click(object sender, EventArgs e)
        {
            Person person = new Person();

            FileStream stream = new FileStream(@"c:\temp\person.dat", FileMode.Open);

            BinaryFormatter bFormat = new BinaryFormatter();

            person = (Person)bFormat.Deserialize(stream);//反序列化得到的是一个object对象.必须做下类型转换

            stream.Close();

            Console.WriteLine(person.age + person.name + person.secret);//结果为18tom.因为secret没有有被序列化.
        }

        private void btnXmlSerialize_Click(object sender, EventArgs e)
        {
            Person person = new Person();

            person.age = 18;

            person.name = "tom";

            person.secret = "i will not tell you";

            FileStream stream = new FileStream(@"c:\temp\xmlFormat.xml", FileMode.Create);

            XmlSerializer xmlserilize = new XmlSerializer(typeof(Person));

            xmlserilize.Serialize(stream, person);

            stream.Close();
        }

        private void btnXmlDeserialize_Click(object sender, EventArgs e)
        {
            Person person = new Person();

            FileStream stream = new FileStream(@"c:\temp\xmlFormat.xml", FileMode.Open);

            XmlSerializer xmlserilize = new XmlSerializer(typeof(Person));

            person = (Person)xmlserilize.Deserialize(stream);

            stream.Close();

            Console.WriteLine(person.age + person.name + person.secret);
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }
    }
}
