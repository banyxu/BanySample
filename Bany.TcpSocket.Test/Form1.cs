using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using Bany.TcpSocket;

namespace Bany.TcpSocket.Test
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        TcpSocketServer server;
        private void btnStartService_Click(object sender, EventArgs e)
        {
            server = new TcpSocketServer("192.168.40.125",9000);
            server.ConnectionCreatedHandler += ShowMessage;
            server.ConnectionDisConnectHandler += ShowMessage;
            server.ReceivedDataHandler += ShowMessage;
            server.ShowMessageHandler += ShowMessage;
            server.StartListener();
        }
        TcpSocketClient client;
        public void ShowMessage(string messge)
        {
            this.BeginInvoke(new MethodInvoker(() => { textBox1.AppendText(messge + "\r\n"); }));
        }

        private void btnSend_Click(object sender, EventArgs e)
        {
            string strMessage = txtSend.Text;
            client.SendData(strMessage);
        }

        private void btnConnectServer_Click(object sender, EventArgs e)
        {
            client = new TcpSocketClient("192.168.40.125", 9000);
           // client.Open();
        }

        private void btnSendBatch_Click(object sender, EventArgs e)
        {
            if (client == null)
            {
                client = new TcpSocketClient("192.168.40.125", 9000);
            }
            Stopwatch sw = new Stopwatch();
            sw.Start();
            string strMessage = txtSend.Text;
          
            for (int i = 0; i < 1000; i++)
            {
                client.SendData(strMessage + i.ToString());
            }
            client.SendData("");
            sw.Stop();
        }
    }
}
