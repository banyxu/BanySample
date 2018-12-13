using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Bany.Serialize
{
    [Serializable] //如果要想保存某个class中的字段,必须在class前面加个这样attribute(C#里面用中括号括起来的标志符)
    public class Person
    {
        public int age;

        public string name;

        [NonSerialized] //如果某个字段不想被保存,则加个这样的标志

        public string secret;

    }
}
