const MusicItem = ({ item }) => {
    if (!item) {
        return <div>暂无歌曲信息</div>;
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            margin: "5px 0",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center", // 垂直居中对齐
            }}>
                <h3 style={{ margin: "0", fontSize: "0.9em", marginRight: "10px" }}>{item.title}</h3>
                <p style={{ margin: "0", color: "#666", fontSize: "0.9em" }}>{item.artist}</p>
            </div>
            <p style={{ margin: "0", fontWeight: "bold", fontSize: "1em" }}>{item.duration}</p>
        </div>
    );
};

export default MusicItem;
