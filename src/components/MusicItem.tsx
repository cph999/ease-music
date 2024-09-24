const MusicItem = ({ item, onSongClick }) => {
    if (!item) {
        return <div>暂无歌曲信息</div>;
    }


    return (
        <div
            onClick={onSongClick} // 直接传递函数引用
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                cursor: "pointer", // 增加光标样式
                transition: "background-color 0.3s", // 添加过渡效果
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e9e9e9"; // 悬停效果
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9f9f9"; // 恢复原色
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <h3 style={{ margin: "0", fontSize: "0.9em", marginRight: "10px" }}>{item.title}</h3>
                <p style={{ margin: "0", color: "#666", fontSize: "0.9em" }}>{item.artist}</p>
            </div>
            <p style={{ margin: "0", fontWeight: "bold", fontSize: "1em" }}>{item.duration}</p>
        </div>
    );
};

export default MusicItem;
