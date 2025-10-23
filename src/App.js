import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
`;

const Sidebar = styled.div`
  width: 350px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
`;

const FlowContainer = styled.div`
  flex-grow: 1;
  height: 100%;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 1.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
`;

const DragNode = styled.div`
  padding: 12px;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  text-align: center;
  cursor: grab;
  background: white;
  font-weight: 600;
  color: #3b82f6;
  transition: all 0.2s ease;

  &:hover {
    background: #3b82f6;
    color: white;
    border-style: solid;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: ${(props) =>
    props.variant === "reset"
      ? "#6b7280"
      : props.variant === "export"
      ? "#8b5cf6"
      : "#10b981"};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.variant === "reset"
        ? "#4b5563"
        : props.variant === "export"
        ? "#7c3aed"
        : "#059669"};
  }
`;

const Section = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #64748b;
  font-size: 0.9rem;
`;

const ListItem = styled.li`
  margin-bottom: 5px;
`;

const ConnectionsArray = styled(Section)`
  max-height: 300px;
  overflow-y: auto;
`;

const ConnectionItem = styled.div`
  padding: 8px;
  margin-bottom: 6px;
  background: #f1f5f9;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
  font-size: 0.8rem;
`;

const DataSection = styled(Section)`
  background: #fff7ed;
  border: 1px solid #fdba74;
`;

const Pre = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
`;

const CopyButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

// Initial nodes
const initialNodes = [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: {
      label: "Initial Button",
      type: "initial",
      createdAt: new Date().toISOString(),
    },
    style: {
      background: "#10b981",
      color: "white",
      border: "2px solid #059669",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "bold",
    },
  },
];

const initialEdges = [];

let nodeId = 2;
const getNodeId = () => `${nodeId++}`;

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowData, setFlowData] = useState({
    nodes: [],
    edges: [],
    connections: [],
    metadata: {},
  });

  console.log("flowData----->", flowData);

  // Update structured data whenever nodes or edges change
  useEffect(() => {
    const structuredNodes = nodes.map((node) => ({
      nodeId: node.id,
      label: node.data.label,
      type: node.data.type || "regular",
      position: node.position,
      style: node.style,
      createdAt: node.data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const structuredEdges = edges.map((edge) => ({
      edgeId: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      sourceLabel: nodes.find((n) => n.id === edge.source)?.data.label,
      targetLabel: nodes.find((n) => n.id === edge.target)?.data.label,
      connectionType: "direct",
      createdAt: new Date().toISOString(),
    }));

    const connections = edges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);

      return {
        connectionId: edge.id,
        source: {
          id: sourceNode?.id,
          label: sourceNode?.data.label,
          type: sourceNode?.data.type,
        },
        target: {
          id: targetNode?.id,
          label: targetNode?.data.label,
          type: targetNode?.data.type,
        },
        timestamp: new Date().toISOString(),
      };
    });

    const metadata = {
      totalNodes: nodes.length,
      totalConnections: edges.length,
      hasInitialNode: nodes.some((n) => n.data.type === "initial"),
      hasFinalNode: nodes.some((n) => n.data.type === "final"),
      flowCreatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setFlowData({
      nodes: structuredNodes,
      edges: structuredEdges,
      connections,
      metadata,
    });
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) {
        return;
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getNodeId(),
        type: "default",
        position,
        data: {
          label: `Step ${nodes.length}`,
          type: "regular",
          createdAt: new Date().toISOString(),
        },
        style: {
          background: "#3b82f6",
          color: "white",
          border: "2px solid #1d4ed8",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: "bold",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, nodes.length]
  );

  const addButton = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      type: "default",
      position: {
        x: Math.random() * 300,
        y: Math.random() * 300,
      },
      data: {
        label: `Step ${nodes.length}`,
        type: "regular",
        createdAt: new Date().toISOString(),
      },
      style: {
        background: "#3b82f6",
        color: "white",
        border: "2px solid #1d4ed8",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "bold",
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, nodes.length]);

  const addFinalButton = useCallback(() => {
    const finalNode = {
      id: getNodeId(),
      type: "default",
      position: { x: 200, y: 300 },
      data: {
        label: "Final Button",
        type: "final",
        createdAt: new Date().toISOString(),
      },
      style: {
        background: "#ef4444",
        color: "white",
        border: "2px solid #dc2626",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "bold",
      },
    };
    setNodes((nds) => nds.concat(finalNode));
  }, [setNodes]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
  }, [setNodes, setEdges]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flow-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [flowData]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(flowData, null, 2));
    alert("Flow data copied to clipboard!");
  }, [flowData]);

  return (
    <AppContainer>
      <Sidebar>
        <div>
          <Title>Button Flow Builder</Title>
          <Subtitle>Create, connect, and export flow data</Subtitle>
        </div>

        <DragNode
          onDragStart={(event) => {
            event.dataTransfer.setData("application/reactflow", "default");
            event.dataTransfer.effectAllowed = "move";
          }}
          draggable
        >
          📝 Drag to Add Button
        </DragNode>

        <ButtonContainer>
          <ActionButton onClick={addButton}>➕ Add Step Button</ActionButton>
          <ActionButton onClick={addFinalButton}>
            🎯 Add Final Button
          </ActionButton>
          <ActionButton onClick={resetFlow} variant="reset">
            🔄 Reset Flow
          </ActionButton>
          <ActionButton onClick={exportData} variant="export">
            💾 Export JSON
          </ActionButton>
        </ButtonContainer>

        <ConnectionsArray>
          <SectionTitle>
            Connections ({flowData.connections.length})
            <CopyButton onClick={copyToClipboard}>Copy</CopyButton>
          </SectionTitle>
          {flowData.connections.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              No connections yet
            </div>
          ) : (
            flowData.connections.map((connection) => (
              <ConnectionItem key={connection.connectionId}>
                <strong>{connection.source.label}</strong>
                <span style={{ color: "#64748b", margin: "0 8px" }}>→</span>
                <strong>{connection.target.label}</strong>
              </ConnectionItem>
            ))
          )}
        </ConnectionsArray>

        {/* <DataSection>
          <SectionTitle>Structured Data</SectionTitle>
          <Pre>{JSON.stringify(flowData, null, 2)}</Pre>
        </DataSection> */}

        {/* <Section>
          <SectionTitle>Database Schema</SectionTitle>
          <List>
            <ListItem>
              <strong>nodes:</strong> id, label, type, position, timestamps
            </ListItem>
            <ListItem>
              <strong>edges:</strong> id, source, target, connection type
            </ListItem>
            <ListItem>
              <strong>connections:</strong> structured relationship data
            </ListItem>
            <ListItem>
              <strong>metadata:</strong> flow statistics and timestamps
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Flow Statistics</SectionTitle>
          <List>
            <ListItem>Total Nodes: {flowData.metadata.totalNodes}</ListItem>
            <ListItem>
              Total Connections: {flowData.metadata.totalConnections}
            </ListItem>
            <ListItem>
              Initial Node: {flowData.metadata.hasInitialNode ? "✅" : "❌"}
            </ListItem>
            <ListItem>
              Final Node: {flowData.metadata.hasFinalNode ? "✅" : "❌"}
            </ListItem>
          </List>
        </Section> */}
      </Sidebar>

      <FlowContainer onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap
            nodeColor={(node) => {
              if (node.data.type === "initial") return "#10b981";
              if (node.data.type === "final") return "#ef4444";
              return "#3b82f6";
            }}
          />
          <Controls />
          <Background />
        </ReactFlow>
      </FlowContainer>
    </AppContainer>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default App;
