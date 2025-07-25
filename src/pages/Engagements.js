import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Modal,
  Table,
  Alert,
  Navbar,
  Nav,
  Card,
  Badge
} from 'react-bootstrap';
import iconx from '../Resources/iconx.png';
import iconssearch from '../Resources/iconssearch.png';
import iconsedit from '../Resources/iconsedit.png';
import iconsadd from '../Resources/iconsadd.png';
import iconsdelete from '../Resources/iconsdelete.png';
import { useUser } from './UserContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

const stripHtmlTags = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const EngagementsManagement = () => {
  const { account } = useUser();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 
  
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-USER-EMAIL": account && account.username ? account.username : ""
    };
  };
  const redirectToMIOG = () => {
    window.location.href = 'https://miog.ac.ke/';
  };
  const [consultants, setConsultants] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [availableDisciplines, setAvailableDisciplines] = useState([]);
  const [consultantDisciplines, setConsultantDisciplines] = useState([]);
  const [error, setError] = useState(null); // Page-level errors
  const [modalError, setModalError] = useState(null); // Modal-specific errors
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState(null);
  const [formData, setFormData] = useState({
    ConsultantID: '',
    isEngaged: false,
    engagementDescription: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    remarks: '',
    status: 'Active',
    DisciplineID: '',
    contractCurrency: ''
  });


  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const totalPages = Math.ceil(consultants.length / recordsPerPage);

 
  const paginatedConsultants = consultants.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!account) return; 
      try {
        const consultantsRes = await fetch(`${API_BASE_URL}?entity=consultants&action=read`, {
          headers: getAuthHeaders(),
        });
        if (!consultantsRes.ok) throw new Error('Failed to fetch consultants', {
          headers: getAuthHeaders(),
        });
        const consultantsData = await consultantsRes.json();
        
        const activeConsultants = consultantsData.filter(c => !c.deleted_at);
        setConsultants(activeConsultants);

        const engagementsRes = await fetch(`${API_BASE_URL}?entity=engagements&action=read`, {
          headers: getAuthHeaders(),
        });
        if (!engagementsRes.ok) throw new Error('Failed to fetch engagements');
        const engagementsData = await engagementsRes.json();
        setEngagements(engagementsData);

        const disciplinesRes = await fetch(`${API_BASE_URL}?entity=disciplines&action=read`, {
          headers: getAuthHeaders(),
        });
        if (!disciplinesRes.ok) throw new Error('Failed to fetch disciplines');
        const disciplinesData = await disciplinesRes.json();
        setAvailableDisciplines(disciplinesData);

        const consDiscRes = await fetch(`${API_BASE_URL}?entity=consultant_disciplines&action=read`, {
          headers: getAuthHeaders(),
        });
        if (!consDiscRes.ok) throw new Error('Failed to fetch consultant disciplines');
        const consDiscData = await consDiscRes.json();
        setConsultantDisciplines(consDiscData);

        setIsLoading(false);
      } catch (err) {
        // setError(err.message);
        // redirectToMIOG(); 
        setIsLoading(false);
      }
    };

    fetchData();
  }, [account]);

  const getConsultantName = (consultant) =>
    consultant?.ConsultantName || consultant?.name || 'Unknown';

  
  const handleSelectConsultant = (consultant) => {
    setSelectedConsultant(consultant);
    setSearchTerm('');
  };


  const getConsultantSpecificDisciplines = () => {
    if (!selectedConsultant) return [];
    const mappings = consultantDisciplines.filter(cd =>
      cd.ConsultantID === (selectedConsultant.ConsultantID || selectedConsultant.id) && !cd.deleted_at
    );
    return availableDisciplines.filter(d =>
      mappings.some(m => m.DisciplineID === d.DisciplineID)
    );
  };

  const getDisciplineName = (disciplineId) => {
    const disc = availableDisciplines.find(d => d.DisciplineID === disciplineId);
    return disc ? disc.DisciplineName : 'Unknown';
  };


  const computePeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) {
      months -= 1;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };


  const filteredEngagements = selectedConsultant
    ? engagements.filter(eng =>
        !eng.deleted_at && (eng.ConsultantID === (selectedConsultant.ConsultantID || selectedConsultant.id))
      )
    : [];

  
  const openModal = (engagement = null) => {
    if (engagement) {
      setEditingEngagement(engagement);
      setFormData({
        ConsultantID: engagement.ConsultantID,
        isEngaged: !!engagement.isEngaged,
        engagementDescription: engagement.engagementDescription || '',
        startDate: engagement.startDate || '',
        endDate: engagement.endDate || '',
        contractValue: engagement.contractValue || '',
        remarks: engagement.remarks || '',
        status: engagement.status || 'Active',
        DisciplineID: engagement.DisciplineID || '',
        contractCurrency: engagement.contractCurrency || ''
      });
    } else {
      setEditingEngagement(null);
      setFormData({
        ConsultantID: selectedConsultant ? (selectedConsultant.ConsultantID || selectedConsultant.id) : '',
        isEngaged: false,
        engagementDescription: '',
        startDate: '',
        endDate: '',
        contractValue: '',
        remarks: '',
        status: 'Active',
        DisciplineID: '',
        contractCurrency: ''
      });
    }
    setModalError(null); 
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEngagement(null);
    setModalError(null); 
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setModalError('End date cannot be before start date.'); 
        return;
      }
    }

    const isEditing = !!editingEngagement;
    const method = isEditing ? 'PUT' : 'POST';

    
    const payload = {
      ...formData,
      engagementDescription: stripHtmlTags(formData.engagementDescription),
      remarks: stripHtmlTags(formData.remarks),
      ...(isEditing
        ? {
            EngagementID: editingEngagement.EngagementID,
            updated_by: account?.name,
            updated_at: new Date().toISOString(),
          }
        : {
            created_by: account?.name,
            created_at: new Date().toISOString(),
          }),
    };

    try {
      const response = await fetch(`${API_BASE_URL}?entity=engagements`, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to ${isEditing ? 'update' : 'create'} engagement.`
        );
      }

      const refreshedRes = await fetch(`${API_BASE_URL}?entity=engagements&action=read`, {
        headers: getAuthHeaders(),
      });
      const refreshedData = await refreshedRes.json();
      setEngagements(refreshedData);
      closeModal();
    } catch (err) {
      setModalError(err.message); 
    }
  };

  const handleSoftDelete = async (engagementId) => {
    if (!window.confirm('Are you sure you want to delete this engagement?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}?entity=engagements`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          EngagementID: engagementId,
          deleted_by: account?.name,
          deleted_at: new Date().toISOString()
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete engagement.');
      }
      setEngagements(prev => prev.filter(eng => eng.EngagementID !== engagementId));
    } catch (err) {
      setError(err.message);
    }
  };


  const renderConsultantsTable = () => {

    const filteredConsultants = consultants.filter((c) => {
      const name = c.ConsultantName || c.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

   
    const totalPages = Math.ceil(filteredConsultants.length / recordsPerPage);

 
    const paginatedConsultants = filteredConsultants.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    return (
      <>
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Search Consultant by Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <InputGroup.Text>
                <img src={iconssearch} alt="Search" style={{ width: '20px', height: '20px' }} />
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Consultant Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {paginatedConsultants.length > 0 ? (
              paginatedConsultants.map((c, index) => (
                <tr
                  key={c.ConsultantID || c.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectConsultant(c)}
                >
                  <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                  <td>{c.ConsultantName || c.name}</td>
                  <td>{c.Email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No matching consultant found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </>
    );
  };


  const renderConsultantInfo = () => {
    if (!selectedConsultant) return null;
    return (
      <Card className="mb-4">
        <Card.Header as="h5">
          Consultant Information
          <Button
            variant="link"
            style={{ float: 'right' }}
            onClick={() => setSelectedConsultant(null)}
          >
            Back to Search
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Name:</Col>
            <Col xs={8}>{getConsultantName(selectedConsultant)}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Email:</Col>
            <Col xs={8}>{selectedConsultant.Email}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Phone:</Col>
            <Col xs={8}>{selectedConsultant.phone}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Speciality:</Col>
            <Col xs={8}>
              {getConsultantSpecificDisciplines().map((disc, idx) => (
                <Badge bg="info" key={idx} className="me-1">
                  {disc.DisciplineName}
                </Badge>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };


  const renderEngagementsTable = () => {
    return (
      <>
        <Row className="mb-3">
          <Col>
            <h5>Engagements</h5>
          </Col>
          <Col className="text-end">
            <Button style={{ backgroundColor: 'green' }} onClick={() => openModal()}>
              <img
                src={iconsadd}
                alt="Add"
                style={{ width: '20px', height: '20px', marginRight: '5px' }}
              />
              Add Engagement
            </Button>
          </Col>
        </Row>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Work Assigned</th>
              <th>Speciality</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Period</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Contract Value</th>
              <th>Currency</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngagements.map((eng, index) => (
              <tr key={eng.EngagementID}>
                <td>{index + 1}</td>
                <td>{truncateText(eng.engagementDescription)}</td>
                <td>{getDisciplineName(eng.DisciplineID)}</td>
                <td>{eng.startDate}</td>
                <td>{eng.endDate}</td>
                <td>{computePeriod(eng.startDate, eng.endDate)}</td>
                <td>{eng.status}</td>
                <td>{truncateText(eng.remarks)}</td>
                <td>{eng.contractValue}</td>
                <td>{eng.contractCurrency}</td>
                <td className="text-end">
                  <Button
                    style={{ backgroundColor: '#1e73be' }}
                    size="sm"
                    className="me-2"
                    onClick={() => openModal(eng)}
                  >
                    {/* <img
                      src={iconsedit}
                      alt="Edit"
                      style={{ width: '20px', height: '20px' }}
                    /> */}
                    View/Edit
                  </Button>
                  <Button
                    style={{ backgroundColor: 'red' }}
                    size="sm"
                    onClick={() => handleSoftDelete(eng.EngagementID)}
                  >
                    <img
                      src={iconsdelete}
                      alt="Delete"
                      style={{ width: '20px', height: '20px' }}
                    />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  return (
    <>
    
      <Navbar expand="lg" style={{ backgroundColor: '#1e73be' }} className="py-2">
        <Container fluid>
          <Navbar.Brand className="me-auto" style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Consultant Engagement Management
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="index.html#/home">
                <img src={iconx} alt="Close" style={{ width: '29px', height: '29px' }} />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="px-3 py-4">
        {selectedConsultant ? (
          <>
            {renderConsultantInfo()}
            {renderEngagementsTable()}
          </>
        ) : (
          renderConsultantsTable()
        )}

        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}
      </Container>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingEngagement ? 'Edit Engagement' : 'Add New Engagement'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Work Assigned</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.engagementDescription}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, engagementDescription: value }))
                }
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.remarks}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, remarks: value }))
                }
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Speciality</Form.Label>
              <Form.Select
                name="DisciplineID"
                value={formData.DisciplineID}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Speciality --</option>
                {getConsultantSpecificDisciplines().map((disc) => (
                  <option key={disc.DisciplineID} value={disc.DisciplineID}>
                    {disc.DisciplineName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Currently Engaged"
                name="isEngaged"
                checked={formData.isEngaged}
                onChange={handleChange}
                />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Contract Value</Form.Label>
                  <Form.Control
                    type="number"
                    name="contractValue"
                    value={formData.contractValue}
                    onChange={handleChange}
                    />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="contractCurrency"
                    value={formData.contractCurrency}
                    onChange={handleChange}
                    required
                    >
                    <option value="">-- Select Currency --</option>
                    <option value="USD">USD</option>
                    <option value="KSH">KSH</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                >
                <option value="Active">Active/Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </Form.Select>
            </Form.Group>
                {/* Modal-specific error */}
                {modalError && (
                  <Alert variant="danger" className="mb-3">
                    {modalError}
                  </Alert>
                )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={closeModal}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#1e73be' }} type="submit">
              {editingEngagement ? 'Save Changes' : 'Create Engagement'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default EngagementsManagement;
