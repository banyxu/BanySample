using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Bany.TcpSocket
{
   public class ReceiveDataProcesser
    {
       byte[] data;
       ConcurrentQueue<byte[]> _queueData;
       public Action<string> ReceivedDataHandler;
       public ReceiveDataProcesser()
       {
           _queueData = new ConcurrentQueue<byte[]>();
       }
       public void EnQueue(byte[] item)
       {
           _queueData.Enqueue(item);
       }

       public void ProcessData(byte[] item)
       {
           try
           {
               string strReceiveData = "";
               using (MemoryStream mStream = new MemoryStream())
               {
                   mStream.Position = 0;
                   mStream.Write(item, 0, item.Length);
                   mStream.Flush();
                   mStream.Position = 0;
                   BinaryFormatter bformatter = new BinaryFormatter();
                   object msg = bformatter.Deserialize(mStream);//将接收到的内存流反序列化为对象
                   strReceiveData = msg as string;
               }

               if (ReceivedDataHandler != null)
               {
                   ReceivedDataHandler(strReceiveData);
               }
           }
           catch (Exception ex)
           {
              
           }
           
       }

       public void StartProcess()
       {
          new Thread(()=>{
               while (true)
               {
                   byte[] item;
                   if (_queueData.TryDequeue(out item))
                   {
                       ProcessData(item);
                   }
                   Thread.Sleep(10);
               }
           }).Start();
       }
    }
}
