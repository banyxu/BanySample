using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using Bany.Log;

namespace Bany.TcpSocket
{
    public class TcpSocketClient:IDisposable
    {
        string _remoteIP;
        int _remotePort;
        Socket _tcpSocket;
        private readonly object _socketSyn = new object();
        public TcpSocketClient(string remoteIP, int port)
        {
            _remoteIP = remoteIP;
            _remotePort = port;
        }
        private void Open()
        {
            //对本地的端口进行绑定
            _tcpSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            //允许端口重用
            _tcpSocket.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            _tcpSocket.Bind(new IPEndPoint(IPAddress.Any, 0));
            //服务端终结点
            IPEndPoint serverEndpoint = new IPEndPoint(IPAddress.Parse(_remoteIP), _remotePort);
            try
            {
                _tcpSocket.Connect(serverEndpoint);
            }
            catch (Exception ex)
            {
                LogHelper.Log("TcpSocketClient.Open" + ex.Message);
            }
        }

        /// <summary>
        /// 发送数据，发送后关闭Socket
        /// </summary>
        /// <param name="sendData"></param>
        /// <returns></returns>
        public bool SendDataOnce(object sendData)
        {
            lock (_socketSyn)
            {
                try
                {
                    Open();
                    using (MemoryStream mStream = new MemoryStream())
                    {
                        BinaryFormatter bformatter = new BinaryFormatter(); //二进制序列化类
                        bformatter.Serialize(mStream, sendData);
                        mStream.Flush();
                        byte[] buffer = new byte[1024];
                        mStream.Position = 0; //将流的当前位置重新归0，否则Read方法将读取不到任何数据
                        while (mStream.Read(buffer, 0, buffer.Length) > 0)
                        {
                            _tcpSocket.Send(buffer); //从内存中读取二进制流，并发送
                        }
                        _tcpSocket.Close();
                    }
                }
                catch (SocketException sockexcept)
                {
                   LogHelper.LogError("TcpSocketClient.SendData"+sockexcept.Message);
                   return false;
                }
                catch (Exception excp)
                {
                    LogHelper.LogError("TcpSocketClient.SendData" + excp.Message);
                    return false;
                }
            }
            return true;
        }

        /// <summary>
        ///  发送数据，保持socket链接，可多次发送
        /// </summary>
        /// <param name="sendData"></param>
        /// <returns></returns>
        public bool SendData(object sendData)
        {
            if (_tcpSocket == null)
            {
                Open();
            }
            lock (_socketSyn)
            {
                try
                {
                   
                    using (MemoryStream mStream = new MemoryStream())
                    {
                        BinaryFormatter bformatter = new BinaryFormatter(); //二进制序列化类
                        bformatter.Serialize(mStream, sendData);
                        mStream.Flush();
                        byte[] buffer = new byte[1024];
                        mStream.Position = 0; //将流的当前位置重新归0，否则Read方法将读取不到任何数据
                        while (mStream.Read(buffer, 0, buffer.Length) > 0)
                        {
                            _tcpSocket.Send(buffer); //从内存中读取二进制流，并发送
                        }
                    }
                }
                catch (SocketException sockexcept)
                {
                    LogHelper.LogError("TcpSocketClient.SendData" + sockexcept.Message);
                    return false;
                }
                catch (Exception excp)
                {
                    LogHelper.LogError("TcpSocketClient.SendData" + excp.Message);
                    return false;
                }
            }
            return true;
        }

        /// <summary>
        /// 关闭socket
        /// </summary>
        /// <param name="socket"></param>
        private void ShutDownSocket(ref Socket socket)
        {
            if (socket != null)
            {
                try
                {
                    socket.Shutdown(SocketShutdown.Both);
                    socket.Close();
                }
                catch (Exception)
                {
                    //  Console.WriteLine("释放连接");   
                }
            }

        }

        /// <summary>
        /// 释放
        /// </summary>
        public void Dispose()
        {
            if (_tcpSocket != null)
            {
                lock (_socketSyn)
                {
                    _tcpSocket.Shutdown(SocketShutdown.Both);
                    _tcpSocket.Disconnect(true);
                    _tcpSocket.Dispose();
                }
                _tcpSocket = null;
            }
        }
    }
}
