import { RightOutlined } from "@ant-design/icons";
import { Divider } from "antd";

const App = () => {
  return (
    <>
      <div style={{ padding: "0 0" }}>
        <Divider />
      </div>

      <div
        style={{
          border: "1px solid rgba(242,242,242,1)",
          borderRadius: 8,
          // marginTop: 16,
          padding: 16,
          margin: "24px 0",
          background: "rgba(255,255,255,1)",
        }}
      >
        <h3
          style={{
            height: 22,
            fontWeight: 700,
            fontSize: 14,
            color: "#333",
            textAlign: "left",
            // lineHeight: 22,

            marginBottom: 16,
          }}
        >
          Batch Job Creation Process
        </h3>

        <div style={{ width: "100%", display: "flex" }}>
          <div
            style={{
              border: "1px solid rgba(242,242,242,1)",
              borderRadius: 8,
              background: "#fff",
              width: "23%",
              paddingTop: 18,
            }}
          >
            <p
              style={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="17559"
                width="25"
                height="25"
              >
                <path
                  d="M896 256v512c0 106.048-186.24 192-416 192S64 874.048 64 768V256c0-106.048 186.24-192 416-192S896 149.952 896 256z"
                  fill="#7D81E1"
                  p-id="17560"
                ></path>
                <path
                  d="M480 448c148.224 0 278.336-35.776 352-89.6v64C758.336 476.16 628.224 512 480 512S201.664 476.224 128 422.4v-64C201.664 412.16 331.776 448 480 448z m0 256c148.224 0 278.336-35.776 352-89.6v64c-73.664 53.824-203.776 89.6-352 89.6s-278.336-35.776-352-89.6v-64c73.664 53.824 203.776 89.6 352 89.6zM256 544a32 32 0 1 1-64 0 32 32 0 0 1 64 0zM224 832a32 32 0 1 0 0-64 32 32 0 0 0 0 64z"
                  fill="#FFFFFF"
                  p-id="17561"
                ></path>
              </svg>
            </p>
            <p
              style={{
                color: "#1e202d",
                fontSize: 12,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Step1
            </p>
            <p
              style={{
                color: "rgba(185,185,185,1)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Select Source
            </p>
          </div>

          <div
            style={{
              width: "2.6%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RightOutlined
              style={{
                fontWeight: 500,
                fontSize: 11,
                color: "rgba(185,185,185,1)",
              }}
            />
          </div>

          <div
            style={{
              border: "1px solid rgba(242,242,242,1)",
              borderRadius: 8,
              background: "#fff",
              width: "23%",
              paddingTop: 18,
            }}
          >
            <p
              style={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="27822"
                width="25"
                height="25"
              >
                <path
                  d="M52.48 320a31.36 31.36 0 0 1 16.64-28.16L497.28 64a30.08 30.08 0 0 1 29.44 0l428.16 227.84a31.424 31.424 0 0 1 16.64 28.16 32.64 32.64 0 0 1-16.64 30.08L526.72 576a30.08 30.08 0 0 1-29.44 0L69.12 348.16A32.64 32.64 0 0 1 52.48 320z m100.48 0L512 512l359.04-192L512 128 152.96 320z m814.72 179.2a31.36 31.36 0 0 1-12.8 42.88L526.72 768a30.08 30.08 0 0 1-29.44 0L69.12 540.16a31.36 31.36 0 0 1-12.8-42.88 31.36 31.36 0 0 1 42.88-13.44L512 704l412.8-220.16a31.36 31.36 0 0 1 42.88 15.36zM512 896l412.8-220.16a31.296 31.296 0 0 1 42.88 15.36 31.488 31.488 0 0 1-12.8 42.88L526.72 960a30.08 30.08 0 0 1-29.44 0l-428.16-227.84a31.36 31.36 0 0 1-12.8-42.88 31.36 31.36 0 0 1 42.88-13.44L512 896z"
                  fill="#5682F7"
                  p-id="27823"
                ></path>
              </svg>
            </p>
            <p
              style={{
                color: "#1e202d",
                fontSize: 12,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Step2
            </p>
            <p
              style={{
                color: "rgba(185,185,185,1)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Select Sink
            </p>
          </div>
          <div
            style={{
              width: "2.6%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RightOutlined
              style={{
                fontWeight: 500,
                fontSize: 11,
                color: "rgba(185,185,185,1)",
              }}
            />
          </div>
          <div
            style={{
              border: "1px solid rgba(242,242,242,1)",
              borderRadius: 8,
              background: "#fff",
              width: "23%",
              paddingTop: 18,
            }}
          >
            <p
              style={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="39516"
                width="25"
                height="25"
              >
                <path
                  d="M380.116992 50.21696L300.285952 96.54272h0.4096l-37.80608 21.95456L166.387712 174.4896S116.252672 203.28448 89.300992 249.28256C59.727872 299.86816 61.366272 388.05504 61.366272 388.05504v217.16992s-1.67936 88.22784 27.93472 138.8544c26.95168 45.99808 77.08672 74.752 77.08672 74.752L249.782272 867.1232l0.4096 0.57344 94.8224 55.05024h0.12288l35.0208 20.2752s75.12064 45.62944 133.5296 45.056c53.12512-0.53248 102.89152-29.696 102.89152-29.696l33.01376-19.12832h0.36864l207.0528-120.2176s50.13504-28.75392 77.16864-74.79296c29.61408-50.5856 27.8528-138.81344 27.8528-138.81344v-116.89984l0.49152 0.73728V357.1712s0.24576-58.04032-25.84576-104.52992c-28.79488-51.11808-105.6768-93.71648-105.6768-93.71648l-79.83104-46.2848 0.28672 0.57344-21.2992-12.32896h0.24576L616.538112 34.816S566.812672 5.61152 513.687552 5.12c-58.44992-0.49152-133.5296 45.09696-133.5296 45.09696z"
                  fill="#796CF4"
                  p-id="39517"
                ></path>
                <path
                  d="M724.918272 715.32544h-98.304a32.768 32.768 0 0 1-32.768-32.768v-64.75776a32.768 32.768 0 0 1 32.768-32.768h32.768v-65.1264H364.470272v65.1264h32.768a32.768 32.768 0 0 1 32.768 32.768v64.75776a32.768 32.768 0 0 1-32.768 32.768H298.934272a32.768 32.768 0 0 1-32.768-32.768v-64.75776a32.768 32.768 0 0 1 32.768-32.768h32.768v-81.34656-0.08192c0-9.0112 7.29088-16.30208 16.30208-16.30208H495.542272v-65.16736h-32.768a32.768 32.768 0 0 1-32.768-32.768V324.608a32.768 32.768 0 0 1 32.768-32.768h98.304a32.768 32.768 0 0 1 32.768 32.768v64.7168a32.768 32.768 0 0 1-32.768 32.768h-32.768v65.20832h147.53792c9.0112 0 16.30208 7.29088 16.30208 16.30208v81.42848h32.768a32.768 32.768 0 0 1 32.768 32.768v64.75776a32.768 32.768 0 0 1-32.768 32.768z"
                  fill="#FFFFFF"
                  p-id="39518"
                ></path>
              </svg>
            </p>
            <p
              style={{
                color: "#1e202d",
                fontSize: 12,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Step3
            </p>
            <p
              style={{
                color: "rgba(185,185,185,1)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Setting
            </p>
          </div>
          <div
            style={{
              width: "2.6%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RightOutlined
              style={{
                fontWeight: 500,
                fontSize: 11,
                color: "rgba(185,185,185,1)",
              }}
            />
          </div>
          <div
            style={{
              border: "1px solid rgba(242,242,242,1)",
              borderRadius: 8,
              background: "#fff",
              width: "23%",
              paddingTop: 18,
            }}
          >
            <p
              style={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="60930"
                width="25"
                height="25"
              >
                <path
                  d="M512 0c282.752 0 512 229.248 512 512s-229.248 512-512 512S0 794.752 0 512 229.248 0 512 0zM371.2 250.666667l-2.261333 0.298666a8.533333 8.533333 0 0 0-6.272 8.234667v28.8H293.333333l-4.992 0.298667a42.666667 42.666667 0 0 0-37.674666 42.368V768l0.298666 4.992a42.666667 42.666667 0 0 0 42.368 37.674667h437.333334l4.992-0.298667a42.666667 42.666667 0 0 0 37.674666-42.368V330.666667l-0.298666-4.992a42.666667 42.666667 0 0 0-42.368-37.674667H661.333333v-28.8l-0.298666-2.261333a8.533333 8.533333 0 0 0-8.234667-6.272z m256 398.976v35.498666H405.333333v-35.498666h221.866667z m-110.933333-203.776l75.434666 75.434666h-56.576v88.746667h-37.717333v-88.746667h-56.576L516.266667 445.866667z m107.733333-157.866667v37.333333h-224V288h224z"
                  fill="#7653D6"
                  p-id="60931"
                ></path>
              </svg>
            </p>
            <p
              style={{
                color: "#1e202d",
                fontSize: 12,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              Step4
            </p>
            <p
              style={{
                color: "rgba(185,185,185,1)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Run
            </p>
          </div>

          <div style={{ padding: "0 16px" }}>
            <Divider />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
