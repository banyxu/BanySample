using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Threading;
using Bany.Log;

namespace Bany.TcpSocket
{
    public class TcpSocketServer
    {
        string _localIP; //服务端ip
        int _port;// 服务端端口
        bool _isListen = true;
        bool _keepLiveMode = true;
        
        public TcpSocketServer(string serverIp, int port)
        {
            _localIP = serverIp;
            _port = port;
        }

        public void StartListener()
        {
            try
            {
                IPAddress address = IPAddress.Parse(_localIP);
                IPEndPoint endPoint = new IPEndPoint(address, _port);
                Socket serverSocket = new Socket(endPoint.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
                serverSocket.Bind(endPoint);
                serverSocket.Listen(10);
                ShowMessage("开始监听");
                Thread threadListener = new Thread(AcceptInfoAsyn);
                threadListener.IsBackground = true;
                threadListener.Start(serverSocket);
            }
            catch (Exception ex)
            {
                LogHelper.LogError("TcpSocketServer.StartListener" + ex.Message);
            }
            
        }

        private void AcceptInfo(object o)
        {
            Socket socket = o as Socket;
            while (_isListen)
            {
                Socket tSocket = socket.Accept();
                if (_keepLiveMode)
                {
                    //链接成功
                    if (ConnectionCreatedHandler != null)
                    {
                        ConnectionCreatedHandler(tSocket.RemoteEndPoint.ToString());
                    }
                    //开始接受数据
                    Thread threadReceive = new Thread(ReceiveData);
                    threadReceive.IsBackground = true;
                    threadReceive.Start(tSocket);
                }
            }
        }

        private void ReceiveData(object o)
        {
            try
            {
                Socket client = o as Socket;
                byte[] buffer = new byte[1024 * 1024];
                //int count=client.Receive(buffer);
                string strReceiveData = "";
                using (MemoryStream mStream = new MemoryStream())
                {
                    mStream.Position = 0;
                    int receiveCount = 0;
                    while (true)
                    {
                        receiveCount = client.Receive(buffer, 1024 * 1024, 0);
                        if (receiveCount == 0)
                        {
                            break;
                        }
                        mStream.Write(buffer, 0, receiveCount);
                    }
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
                client.Close();
                client.Dispose();
            }
            catch (Exception ex)
            {
                LogHelper.LogError("TcpSocketServer.ReceiveData+" + ex.Message);
            }
        }

        List<byte[]> byteCache = new List<byte[]>();
        private void AcceptInfoAsyn(object o)
        {
            Socket socket = o as Socket;
            while (_isListen)
            {
                Socket tSocket = socket.Accept();
                if (_keepLiveMode)
                {
                    //链接成功
                    if (ConnectionCreatedHandler != null)
                    {
                        ConnectionCreatedHandler(tSocket.RemoteEndPoint.ToString());
                    }
                    //开始接受数据
                    Thread threadReceive = new Thread(ReceiveDataAsyn);
                    threadReceive.IsBackground = true;
                    threadReceive.Start(tSocket);
                }
            }                                                          
        }

        ReceiveDataProcesser process;
        private void ReceiveDataAsyn(object o)
        {
            try
            {
              
                Socket client = o as Socket;
                process = new ReceiveDataProcesser();
                if (ReceivedDataHandler!=null)
                {
                    process.ReceivedDataHandler += ReceivedDataHandler;
                }
                process.StartProcess();

                while (true)
                {
                    byte[] buffer = new byte[1024];
                    int receiveCount = client.Receive(buffer);
                    if (receiveCount != -1 && receiveCount != 0)
                    {
                       // byteCache.Add(buffer);
                        process.EnQueue(buffer);
                    }


                    //if (receiveCount > 0)
                    //{
                    //    process.EnQueue(buffer);
                    //}
                }
            }
            catch (Exception ex)
            {
                LogHelper.LogError("TcpSocketServer.ReceiveData+" + ex.Message);
            }
        }

        private void ShowMessage(string message)
        {
            if (ShowMessageHandler != null)
            {
                ShowMessageHandler(message);
            }
        }
        public Action<string> ConnectionDisConnectHandler;
        public Action<string> ReceivedDataHandler;
        public Action<string> ConnectionCreatedHandler;
        public Action<string> ShowMessageHandler;
    }
}
