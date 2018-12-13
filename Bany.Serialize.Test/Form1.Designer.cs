namespace Bany.Serialize.Test
{
    partial class Form1
    {
        /// <summary>
        /// 必需的设计器变量。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 清理所有正在使用的资源。
        /// </summary>
        /// <param name="disposing">如果应释放托管资源，为 true；否则为 false。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows 窗体设计器生成的代码

        /// <summary>
        /// 设计器支持所需的方法 - 不要
        /// 使用代码编辑器修改此方法的内容。
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.txtAge = new System.Windows.Forms.TextBox();
            this.txtName = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.txtSecret = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.btnBinarySerialize = new System.Windows.Forms.Button();
            this.btnBinaeryDeSerialize = new System.Windows.Forms.Button();
            this.btnXmlDeserialize = new System.Windows.Forms.Button();
            this.btnXmlSerialize = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(32, 32);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(29, 12);
            this.label1.TabIndex = 0;
            this.label1.Text = "年龄";
            // 
            // txtAge
            // 
            this.txtAge.Location = new System.Drawing.Point(67, 29);
            this.txtAge.Name = "txtAge";
            this.txtAge.Size = new System.Drawing.Size(100, 21);
            this.txtAge.TabIndex = 1;
            this.txtAge.Text = "20";
            // 
            // txtName
            // 
            this.txtName.Location = new System.Drawing.Point(67, 62);
            this.txtName.Name = "txtName";
            this.txtName.Size = new System.Drawing.Size(100, 21);
            this.txtName.TabIndex = 3;
            this.txtName.Text = "Lily";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(32, 65);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(29, 12);
            this.label2.TabIndex = 2;
            this.label2.Text = "姓名";
            // 
            // txtSecret
            // 
            this.txtSecret.Location = new System.Drawing.Point(67, 89);
            this.txtSecret.Name = "txtSecret";
            this.txtSecret.Size = new System.Drawing.Size(100, 21);
            this.txtSecret.TabIndex = 5;
            this.txtSecret.Text = "i will not tell you ";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(32, 92);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(29, 12);
            this.label3.TabIndex = 4;
            this.label3.Text = "秘密";
            // 
            // btnBinarySerialize
            // 
            this.btnBinarySerialize.Location = new System.Drawing.Point(207, 26);
            this.btnBinarySerialize.Name = "btnBinarySerialize";
            this.btnBinarySerialize.Size = new System.Drawing.Size(122, 23);
            this.btnBinarySerialize.TabIndex = 6;
            this.btnBinarySerialize.Text = "Binary序列化";
            this.btnBinarySerialize.UseVisualStyleBackColor = true;
            this.btnBinarySerialize.Click += new System.EventHandler(this.btnBinarySerialize_Click);
            // 
            // btnBinaeryDeSerialize
            // 
            this.btnBinaeryDeSerialize.Location = new System.Drawing.Point(351, 26);
            this.btnBinaeryDeSerialize.Name = "btnBinaeryDeSerialize";
            this.btnBinaeryDeSerialize.Size = new System.Drawing.Size(122, 23);
            this.btnBinaeryDeSerialize.TabIndex = 7;
            this.btnBinaeryDeSerialize.Text = "Binary反序列化";
            this.btnBinaeryDeSerialize.UseVisualStyleBackColor = true;
            this.btnBinaeryDeSerialize.Click += new System.EventHandler(this.btnBinaeryDeSerialize_Click);
            // 
            // btnXmlDeserialize
            // 
            this.btnXmlDeserialize.Location = new System.Drawing.Point(351, 87);
            this.btnXmlDeserialize.Name = "btnXmlDeserialize";
            this.btnXmlDeserialize.Size = new System.Drawing.Size(122, 23);
            this.btnXmlDeserialize.TabIndex = 9;
            this.btnXmlDeserialize.Text = "XML反序列化";
            this.btnXmlDeserialize.UseVisualStyleBackColor = true;
            this.btnXmlDeserialize.Click += new System.EventHandler(this.btnXmlDeserialize_Click);
            // 
            // btnXmlSerialize
            // 
            this.btnXmlSerialize.Location = new System.Drawing.Point(207, 87);
            this.btnXmlSerialize.Name = "btnXmlSerialize";
            this.btnXmlSerialize.Size = new System.Drawing.Size(122, 23);
            this.btnXmlSerialize.TabIndex = 8;
            this.btnXmlSerialize.Text = "XML序列化";
            this.btnXmlSerialize.UseVisualStyleBackColor = true;
            this.btnXmlSerialize.Click += new System.EventHandler(this.btnXmlSerialize_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(689, 401);
            this.Controls.Add(this.btnXmlDeserialize);
            this.Controls.Add(this.btnXmlSerialize);
            this.Controls.Add(this.btnBinaeryDeSerialize);
            this.Controls.Add(this.btnBinarySerialize);
            this.Controls.Add(this.txtSecret);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.txtName);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.txtAge);
            this.Controls.Add(this.label1);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox txtAge;
        private System.Windows.Forms.TextBox txtName;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox txtSecret;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button btnBinarySerialize;
        private System.Windows.Forms.Button btnBinaeryDeSerialize;
        private System.Windows.Forms.Button btnXmlDeserialize;
        private System.Windows.Forms.Button btnXmlSerialize;
    }
}

