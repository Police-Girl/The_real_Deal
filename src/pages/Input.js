import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import iconx from '../Resources/iconx.png';
import iconsedit from '../Resources/iconsedit.png';
import iconsdelete from '../Resources/iconsdelete.png';
import iconssearch from '../Resources/iconssearch.png';
import { useUser } from './UserContext';
import { InputGroup } from "react-bootstrap";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_ORIGIN = process.env.REACT_APP_API_BASE_ORIGIN;



const Input = () => {
  // Consultant fields
  const [activeTab, setActiveTab] = useState('create');
  const [consultantName, setConsultantName] = useState('');
  const [Email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consultantType, setConsultantType] = useState('');
  // const [educationLevel, setEducationLevel] = useState('');


  const [availableDisciplines, setAvailableDisciplines] = useState([]);
  const [consultantDisciplines, setConsultantDisciplines] = useState([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState([]);
  const [originalSelectedDisciplines, setOriginalSelectedDisciplines] = useState([]);

  const [attachments, setAttachments] = useState([]);
  const [availableAttachmentTypes, setAvailableAttachmentTypes] = useState([]);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);


  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const { account } = useUser();


  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterConsultantType, setFilterConsultantType] = useState('all');
  const [filterEducationLevel, setFilterEducationLevel] = useState('all');
  const consultantTypes = ['firm', 'individual'];

 
  const [educationLevel, setEducationLevel] = useState('');
  // const [title, setTitle] = useState('');


  const [county, setCounty] = useState('');
  const [streetName, setStreetName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [poBox, setPoBox] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [townCity, setTownCity] = useState('');
  const [counties, setCounties] = useState([]);
  const [isLoadingCounties, setIsLoadingCounties] = useState(true);

  const [validityToggle, setValidityToggle] = useState('no'); 
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [attachmentMessage, setAttachmentMessage] = useState(''); 
  

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-USER-EMAIL": account && account.username ? account.username : ""
    };
  };

  const redirectToMIOG = () => {
    // window.location.href = 'https://miog.ac.ke/';
  };



  // Fetch data
  useEffect(() => {
    if (!account) return;
    const fetchDisciplines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}?entity=disciplines&action=read`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

       
        if (Array.isArray(data)) {
          setAvailableDisciplines(data);
        } else {
          // console.error('Invalid disciplines data:', data);
          // redirectToMIOG();
          setAvailableDisciplines([]); 
        }
      } catch (error) {
        // console.error('Error fetching disciplines:', error);
        // redirectToMIOG();
        setAvailableDisciplines([]); 
      }
    };

    fetchDisciplines();
  }, [account]);

  useEffect(() => {
    if (!account) return;
    const fetchData = async () => {
      try {

        const cdResponse = await fetch(`${API_BASE_URL}?entity=consultant_disciplines&action=read`, {
          headers: getAuthHeaders(),
        });
        const cdData = await cdResponse.json();
        setConsultantDisciplines(cdData);

     
        const consultantsResponse = await fetch(`${API_BASE_URL}?entity=consultants&action=read`, {
          headers: getAuthHeaders(),
        });
        let consultantsData = [];
        try {
          const data = await consultantsResponse.json();
          consultantsData = Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Invalid consultants response:', error);
        }
        setConsultants(consultantsData);

       
        const attachmentTypesResponse = await fetch(`${API_BASE_URL}?entity=attachmentTypes&action=read`, {
          headers: getAuthHeaders(),
        });
        const attachmentTypesData = await attachmentTypesResponse.json();
        setAvailableAttachmentTypes(Array.isArray(attachmentTypesData) ? attachmentTypesData : []);

      } catch (err) {
        // setError(err.message);
        // redirectToMIOG();
      }
    };
    fetchData();
  }, [account]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'created') {
        try {
          // Fetch consultants
          const consultantsResponse = await fetch(`${API_BASE_URL}?entity=consultants&action=read`, {
            headers: getAuthHeaders(),
          });
          const consultantsData = await consultantsResponse.json();
          setConsultants(consultantsData);

          // Fetch consultant-disciplines
          const cdResponse = await fetch(`${API_BASE_URL}?entity=consultant_disciplines&action=read`, {
            headers: getAuthHeaders(),
          });
          const cdData = await cdResponse.json();
          setConsultantDisciplines(cdData);
        } catch (err) {
          // setError(err.message);
          // redirectToMIOG();
        }
      }
    };

    fetchData();
  }, [activeTab]);

  
  useEffect(() => {
    const fetchAttachments = async () => {
      if (showEditModal && editingConsultant) {
        try {
          const response = await fetch(
            `${API_BASE_URL}?entity=attachment&consultantID=${editingConsultant.ConsultantID}`, 
            {
              headers: getAuthHeaders(),
            }
          );
          const data = await response.json();
          setAttachments(Array.isArray(data) ? data : []);
        } catch (error) {
          // console.error('Error fetching attachments:', error);
          // redirectToMIOG();
        }
      }
    };
    fetchAttachments();
  }, [showEditModal, editingConsultant,account]);

  
  useEffect(() => {
    if (responseMessage) {
      // console.log('Response Message:', responseMessage);
      const timer = setTimeout(() => setResponseMessage(''), 4000);
      return () => clearTimeout(timer); 
    }
  }, [responseMessage]);

  useEffect(() => {
    if (!account) return;
    const fetchCounties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}?entity=counties&action=read`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        // console.log('Counties API Response:', data);

        if (Array.isArray(data)) {
          setCounties(data);
        } else {
          
          setCounties([]);
        }
      } catch (error) {
        // console.error('Error fetching counties:', error);
        setCounties([]);
      } finally {
        setIsLoadingCounties(false); 
      }
    };

    fetchCounties();
  }, [account]);


  // const mergedConsultants = (consultants || []).map(consultant => {
  //   const mappings = consultantDisciplines.filter(cd =>
  //     cd.ConsultantID === consultant.ConsultantID && !cd.deleted_at
  //   );
  //   const disciplines = mappings.map(mapping => {
  //     const disc = availableDisciplines.find(d => d.DisciplineID === mapping.DisciplineID);
  //     return disc ? disc.DisciplineName : mapping.DisciplineID;
  //   });
  //   return { ...consultant, disciplines };
  // });

  const mergedConsultants = (
  Array.isArray(consultants) ? consultants : []
).map(consultant => {
  const mappings = (Array.isArray(consultantDisciplines) ? consultantDisciplines : [])
    .filter(cd =>
      cd.ConsultantID === consultant.ConsultantID && !cd.deleted_at
    );

  const disciplines = mappings.map(mapping => {
    const disc = (Array.isArray(availableDisciplines) ? availableDisciplines : [])
      .find(d => d.DisciplineID === mapping.DisciplineID);
    return disc ? disc.DisciplineName : mapping.DisciplineID;
  });

  return { ...consultant, disciplines };
});

  const filteredConsultants = mergedConsultants.filter((consultant) => {
    const textMatch =
      consultant.ConsultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultant.phone && consultant.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const disciplineMatch =
      filterDiscipline === 'all' ||
      consultant.disciplines.some((d) => {
        const disc = availableDisciplines.find((ad) => ad.DisciplineName === d);
        return disc?.DisciplineID.toString() === filterDiscipline;
      });

    const typeMatch =
      filterConsultantType === 'all' || consultant.consultantType.toLowerCase() === filterConsultantType.toLowerCase();

    const educationMatch =
      filterEducationLevel === 'all' || consultant.education_level === filterEducationLevel;

    return textMatch && disciplineMatch && typeMatch && educationMatch;
  });


  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 
  const handleDisciplineClick = (disciplineId) => {
    setSelectedDisciplines(prev => 
      prev.includes(disciplineId) 
        ? prev.filter(id => id !== disciplineId) 
        : [...prev, disciplineId]
    );
  };

  


  const handleSubmit = async (e) => {
    e.preventDefault();

    const consultantData = {
      ConsultantName: consultantName,
      Email,
      phone,
      consultantType,
      education_level: educationLevel,
      // title,
      physical_street_name: streetName,
      physical_building_name: buildingName,
      physical_house_number: houseNumber,
      physical_landmark: landmark,
      physical_town_city: townCity,
      physical_county_id: county,
      postal_po_box: poBox,
      postal_postal_code: postalCode,
      postal_post_office_location: postOffice,
      created_by: account.name,
    };

  

    try {
     
      const consultantResponse = await fetch(
        `${API_BASE_URL}?entity=consultants`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(consultantData),
        }
      );
      if (!consultantResponse.ok) {
        const errorResult = await consultantResponse.json();
        throw new Error(errorResult.message);
      }

      const result = await consultantResponse.json();
      const newConsultantId = result.insertId;

      await Promise.all(
        selectedDisciplines.map(async (disciplineId) => {
          const response = await fetch(
            `${API_BASE_URL}?entity=consultant_disciplines`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                ConsultantID: newConsultantId,
                DisciplineID: disciplineId,
                created_by: account.name,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add discipline.");
            // redirectToMIOG();
          }
        })
      );

      
      const cdResponse = await fetch(`${API_BASE_URL}?entity=consultant_disciplines&action=read`, {
        headers: getAuthHeaders(),
      });
      const cdData = await cdResponse.json();
      setConsultantDisciplines(cdData); 

   
      const newConsultant = {
        ConsultantID: newConsultantId,
        ...consultantData,
        disciplines: selectedDisciplines.map((id) => {
          const disc = availableDisciplines.find(
            (d) => d.DisciplineID === parseInt(id)
          );
          return disc ? disc.DisciplineName : id;
        }),
      };
      setConsultants((prev) => [...prev, newConsultant]);
      setResponseMessage("Consultant created successfully!");
      setConsultantName("");
      setEmail("");
      setPhone("");
      setConsultantType("");
      setSelectedDisciplines([]);
    } catch (error) {
      setResponseMessage(error.message || "Error creating consultant.");
    }
  };

  const handleEditClick = (consultant) => {
    setEditingConsultant(consultant);
    const selectedIds = availableDisciplines
      .filter(d => consultant.disciplines.includes(d.DisciplineName))
      .map(d => d.DisciplineID.toString());
    setSelectedDisciplines(selectedIds);
    setOriginalSelectedDisciplines(selectedIds);
      
    setCounty(consultant.physical_county_id || '');
    setStreetName(consultant.physical_street_name || '');
    setBuildingName(consultant.physical_building_name || '');
    setHouseNumber(consultant.physical_house_number || '');
    setLandmark(consultant.physical_landmark || '');
    setTownCity(consultant.physical_town_city || '');
    setPoBox(consultant.postal_po_box || '');
    setPostalCode(consultant.postal_postal_code || '');
    setPostOffice(consultant.postal_post_office_location || '');
    
   
    setEducationLevel(consultant.education_level || '');
    setShowEditModal(true);
  };

 
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      ConsultantName: editingConsultant.ConsultantName,
      Email: editingConsultant.Email,
      phone: editingConsultant.phone,
      consultantType: editingConsultant.consultantType,
      education_level: educationLevel,
      physical_street_name: streetName,
      physical_building_name: buildingName,
      physical_house_number: houseNumber,
      physical_landmark: landmark,
      physical_town_city: townCity,
      physical_county_id: county,
      postal_po_box: poBox,
      postal_postal_code: postalCode,
      postal_post_office_location: postOffice,
      updated_by: account.name,
      ConsultantID: editingConsultant.ConsultantID,
    };


    try {
      // Update consultant record
      const response = await fetch(
        `${API_BASE_URL}?entity=consultants&id=${editingConsultant.ConsultantID}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );
      if (!response.ok) throw new Error("Error updating consultant.");

      // Update disciplines
      const removed = originalSelectedDisciplines.filter(id => !selectedDisciplines.includes(id));
      const added = selectedDisciplines.filter(id => !originalSelectedDisciplines.includes(id));

      await Promise.all([
        ...removed.map(async (disciplineId) => {
          await fetch(
            `${API_BASE_URL}?entity=consultant_disciplines`,
            {
              method: "DELETE",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                ConsultantID: editingConsultant.ConsultantID,
                DisciplineID: parseInt(disciplineId),
                deleted_by: account.name,
              }),
            }
          );
        }),
        ...added.map(async (disciplineId) => {
          await fetch(
            `${API_BASE_URL}?entity=consultant_disciplines`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                ConsultantID: editingConsultant.ConsultantID,
                DisciplineID: parseInt(disciplineId),
                created_by: account.name,
              }),
            }
          );
        }),
      ]);

      // Fetch updated consultants and disciplines
      const consultantsResponse = await fetch(`${API_BASE_URL}?entity=consultants&action=read`, {
        headers: getAuthHeaders(),
      });
      const consultantsData = await consultantsResponse.json();
      setConsultants(consultantsData);

      const cdResponse = await fetch(`${API_BASE_URL}?entity=consultant_disciplines&action=read`, {
        headers: getAuthHeaders(),
      });
      const cdData = await cdResponse.json();
      setConsultantDisciplines(cdData);

      setShowEditModal(false);
      setResponseMessage("Consultant updated successfully.");
    } catch (error) {
      setResponseMessage("Error updating consultant.");
    }
  };

  // Delete consultant
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this consultant?")) {
      try {
        await fetch(
          `${API_BASE_URL}?entity=consultants&id=${id}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              deleted_by: account.name,
              ConsultantID: id
            })
          }
        );
        setConsultants(prev => prev.filter(c => c.ConsultantID !== id));
        setResponseMessage("Consultant deleted successfully.");
      } catch (error) {
        setResponseMessage("Error deleting consultant.");
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedAttachmentType || !fileToUpload) return;
  
    const formData = new FormData();
    formData.append('ConsultantID', editingConsultant.ConsultantID);
    formData.append('AttachmentTypeID', selectedAttachmentType);
    formData.append('file', fileToUpload);
    formData.append('created_by', account.name);
  
    // Only append validity_start and validity_end if they are not null
    if (validityToggle === "yes") {
      if (validFrom) formData.append('validity_start', validFrom);
      if (validTo) formData.append('validity_end', validTo);
    }
  
    try {
      const response = await fetch(
        `${API_BASE_URL}?entity=attachment&consultantID=${editingConsultant.ConsultantID}`,
        { 
          method: 'POST',
          headers: {"X-USER-EMAIL": account?.username || ""},
          body: formData 
        }
      );
  
      if (response.ok) {
        const newAttachment = await response.json();
        setAttachments(prev => [...prev, newAttachment]);
        setAttachmentMessage('Attachment uploaded successfully!');
        setTimeout(() => setAttachmentMessage(''), 3000);
        setSelectedAttachmentType('');
        setFileToUpload(null);
  
        // Fetch updated attachments
        const updatedAttachments = await fetch(
          `${API_BASE_URL}?entity=attachment&consultantID=${editingConsultant.ConsultantID}`, {
            headers: getAuthHeaders(),
          }
        );
        const data = await updatedAttachments.json();
        setAttachments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setAttachmentMessage('Failed to upload attachment. Please try again.');
    }
  };
  

  useEffect(() => {
    if (selectedAttachmentType === "Degrees/Certificates") {
      setValidityToggle("no");
    } else if (selectedAttachmentType === "Licenses") {
      setValidityToggle("yes");
      setValidFrom(new Date().toISOString().split("T")[0]); 
      setValidTo(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0]
      ); 
    }
  }, [selectedAttachmentType]);

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await fetch(
        `${API_BASE_URL}?entity=attachment&id=${attachmentId}`,
        { 
          method: 'DELETE',
          headers: {
            "X-USER-EMAIL": account?.username || "",
            "Content-Type": "application/json"
           },
          body: JSON.stringify({
            AttachmentID: attachmentId,
            deleted_by: account.name })
        }
      );
      setAttachments(prev => prev.filter(a => a.AttachmentID !== attachmentId));
      setResponseMessage("Attachment deleted successfully!");
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

const calculateTimeRemaining = (validFrom, validTo) => {
    if (!validFrom || !validTo) return "";

    const startDate = new Date(validFrom);
    const endDate = new Date(validTo);

    if (isNaN(startDate) || isNaN(endDate)) return "";
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) return "Expired";

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return `${days} days total`;
};



  // Render Edit Form
  const renderEditForm = () => (
    <Form onSubmit={handleEditSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="editName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={editingConsultant?.ConsultantName || ''}
            onChange={(e) => setEditingConsultant(prev => ({
              ...prev,
              ConsultantName: e.target.value
            }))}
            required
          />
        </Form.Group>
        
        <Form.Group as={Col} controlId="editType">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={editingConsultant?.consultantType || ''}
            onChange={(e) => setEditingConsultant(prev => ({
              ...prev,
              consultantType: e.target.value
            }))}
            required
          >
            {/* <option value="">Select</option> */}
            {consultantTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="editEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={editingConsultant?.Email || ''}
            onChange={(e) => setEditingConsultant(prev => ({
              ...prev,
              Email: e.target.value
            }))}
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="editPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            value={editingConsultant?.phone || ''}
            onChange={(e) => setEditingConsultant(prev => ({
              ...prev,
              phone: e.target.value
            }))}
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formEducationLevel">
        <Form.Label>Education Level</Form.Label>
        <Form.Select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          required
        >
          <option value="">Select Education Level</option>
          <option value="PhD">PhD</option>
          <option value="Masters">Masters</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Diploma">Diploma</option>
          <option value="Other">Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="editDisciplines">
  <Form.Label>Specialties</Form.Label>
  <div className="d-flex flex-wrap gap-2">
    {[
      ...availableDisciplines.filter(disc => selectedDisciplines.includes(disc.DisciplineID.toString())),
      ...availableDisciplines.filter(disc => !selectedDisciplines.includes(disc.DisciplineID.toString()))
    ].map((disc) => {
      const isSelected = selectedDisciplines.includes(disc.DisciplineID.toString());
      return (
        <Button
          key={disc.DisciplineID}
          variant={isSelected ? "primary" : "outline-primary"}
          onClick={() => handleDisciplineClick(disc.DisciplineID.toString())}
          className="rounded-pill py-1 px-4 d-flex align-items-center"
          style={{ 
        transition: 'all 0.3s ease',
        borderWidth: '2px',
        fontWeight: 500,
        backgroundColor: isSelected ? '#4a90e2' : 'transparent',
        borderColor: isSelected ? '#4a90e2' : '#dee2e6',
        color: isSelected ? '#fff' : '#4a5568',
        padding: '10px 20px',
        fontSize: '1rem',
        minWidth: '150px',
        justifyContent: 'center'
          }}
        >
          {disc.DisciplineName}
          {isSelected && (
        <span className="ms-3" style={{ fontSize: '0.9em' }}>✓</span>
          )}
        </Button>
      );
        })}
      </div>
      <Form.Text className="text-muted">Click to select multiple specialties</Form.Text>
    </Form.Group>

      <Form.Group className="mb-4" controlId="attachments">
            <Form.Label>Attachments</Form.Label>

            {/* Attachment Type Dropdown */}
            <div className="d-flex gap-3 align-items-center mb-3">
              <Form.Select
                value={selectedAttachmentType}
                onChange={(e) => setSelectedAttachmentType(e.target.value)}
                style={{
                  width: '250px',
                  padding: '10px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                }}
              >
                <option value="">Select Attachment Type</option>
                {availableAttachmentTypes?.map((type) => (
                  <option key={type.AttachmentTypeID} value={type.AttachmentTypeID}>
                    {type.AttachmentName}
                  </option>
                ))}
              </Form.Select>

              {/* File Input */}
              <Form.Control
                type="file"
                onChange={(e) => setFileToUpload(e.target.files[0])}
                style={{
                  width: '250px',
                  padding: '10px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                }}
              />
            </div>

            {/* Expiry Toggle and Save Button */}
            <div className="d-flex align-items-center gap-3">
                      <Form.Group controlId="formValidityToggle" className="mb-0">
                      <Form.Label className="mb-0">Does this document expire?</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Check
                        inline
                        type="radio"
                        label="Yes"
                        name="validityToggle"
                        value="yes"
                        checked={validityToggle === "yes"}
                        onChange={() => setValidityToggle("yes")}
                        />
                        <Form.Check
                        inline
                        type="radio"
                        label="No"
                        name="validityToggle"
                        value="no"
                        checked={validityToggle === "no"}
                        onChange={() => setValidityToggle("no")}
                        />
                      </div>
                      </Form.Group>

                      
                      <Button
                      onClick={handleFileUpload}
                      disabled={!selectedAttachmentType || !fileToUpload}
                      variant="success"
                      style={{
                        padding: '10px 20px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                      }}
                      >
                      Save Attachment
                      </Button>
                    </div>

                    {/* Notification Message */}
                    {attachmentMessage && (
                      <div className="mt-2 text-success">
                      {attachmentMessage}
                      </div>
                    )}
                    {responseMessage && (
                      <div className="mt-2 text-warning">
                      {responseMessage}
                      </div>
                    )}

            {/* Validity Dates */}
            {validityToggle === "yes" && (
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group controlId="formValidFrom">
                    <Form.Label>Valid From</Form.Label>
                    <Form.Control
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      style={{
                        padding: '10px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formValidTo">
                    <Form.Label>Valid To</Form.Label>
                    <Form.Control
                      type="date"
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                      style={{
                        padding: '10px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form.Group>

      <Form.Group className="mb-4" controlId="attachments">

        <Table striped bordered hover>
  <thead>
    <tr>
      <th>File Type</th>
      <th>Validity Countdown</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {attachments?.map((attachment) => {
      const typeName =
        availableAttachmentTypes?.find(
          (t) => parseInt(t.AttachmentTypeID) === parseInt(attachment.AttachmentTypeID)
        )?.AttachmentName || 'Unknown';

      return (
        <tr key={attachment.AttachmentID}>
          <td>{typeName}</td>
          <td>{calculateTimeRemaining(attachment.validity_start, attachment.validity_end)}</td>
          <td>
        <Button
          variant="primary"
          size="sm"
          className="ms-2"
          onClick={() => window.open(`${API_BASE_ORIGIN}/${attachment.FilePath}`, '_blank', 'noopener,noreferrer')}
          style={{
            padding: '7px 15px',
            fontSize: '1rem',
            borderRadius: '5px',
          }}
        >
          View File
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="ms-2"
          onClick={() => handleDeleteAttachment(attachment.AttachmentID)}
          style={{
            padding: '7px 15px',
            fontSize: '1rem',
            borderRadius: '5px',
          }}
        >
          Delete
        </Button>
          </td>
        </tr>
      );
    })}
  </tbody>
</Table>

      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <h5 className="mb-3">Physical Address</h5>
          <Form.Group controlId="formCounty">
            <Form.Label>County</Form.Label>
            {isLoadingCounties ? (
              <p>Loading counties...</p>
            ) : (
              <Form.Select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
              >
                <option value="">Select County</option>
                {Array.isArray(counties) &&
                  counties.map((county) => (
                    <option key={county.county_id} value={county.county_id}>
                      {county.county_name}
                    </option>
                  ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group controlId="formStreetName" className="mt-3">
            <Form.Label>Street Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter street name"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBuildingName" className="mt-3">
            <Form.Label>Building Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter building name"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formHouseNumber" className="mt-3">
            <Form.Label>House/Apt Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter house or apartment number"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formLandmark" className="mt-3">
            <Form.Label>Nearest Landmark (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="E.g. Opposite ABC Mall, Near Roundabout"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <h5 className="mb-3">Postal Address</h5>
          <Form.Group controlId="formPOBox" className="mt-3">
            <Form.Label>P.O. Box</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., P.O. Box 12345"
              value={poBox}
              onChange={(e) => setPoBox(e.target.value)} // Corrected function name
            />
          </Form.Group>

          <Form.Group controlId="formPostalCode" className="mt-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPostOffice" className="mt-3">
            <Form.Label>Post Office Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Nairobi"
              value={postOffice}
              onChange={(e) => setPostOffice(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formTownCity" className="mt-3">
            <Form.Label>Town/City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter town or city"
              value={townCity}
              onChange={(e) => setTownCity(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" style={{ backgroundColor: "#1e73be" }}>
        Save Changes
      </Button>
    </Form>
  );

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: "#1e73be" }} className="py-2">
        <Container fluid>
          <Navbar.Brand style={{ color: "#ffffff", fontWeight: "bold" }}>
            Consultant Management
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="index.html#/home">
              <img src={iconx} alt="Home" style={{ width: '29px', height: '29px' }} />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <div className="container mt-5">
        <h3>Consultant Management</h3>
        
        <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link eventKey="create" style={{fontWeight: '700'}}>Create Consultant</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="created" style={{fontWeight: '700'}}>View Consultants</Nav.Link>
          </Nav.Item>
        </Nav>
        
        {responseMessage && (
          <div className="mt-3 alert alert-info">
            {responseMessage}
          </div>
        )}
  {/* {responseMessage && setTimeout(() => setResponseMessage(''), 4000)} */}

        <div style={{ border: '1px solid #dee2e6', borderTop: 0, padding: '20px' }}>
          {activeTab === 'create' && (
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridName">
                  <Form.Label>
                    Consultant Name <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Name"
                    value={consultantName}
                    onChange={(e) => setConsultantName(e.target.value)}
                    required 
                  />
                </Form.Group>
                
                <Form.Group as={Col} controlId="formGridType">
                  <Form.Label>
                    Category <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
                  <Form.Select 
                    value={consultantType} 
                    onChange={(e) => setConsultantType(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    {consultantTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label>
                    Email <span style={{ color: 'red' }}>*</span>
                  </Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder=" email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control  
                    type="text"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-3" controlId="formEducationLevel">
                <Form.Label>
                  Education Level <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  required
                >
                  <option value="">Select Education Level</option>
                  <option value="PhD">PhD</option>
                  <option value="Masters">Masters</option>
                  <option value="Bachelors">Bachelors</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              {/* Address Section */}
              <Row className="mb-3">
                {/* Physical Address */}
                <Col md={6}>
                  <h5 className="mb-3">Physical Address</h5> {/* Title for Physical Address */}
                  <Form.Group controlId="formCounty">
                    <Form.Label>
                      County <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    {isLoadingCounties ? (
                      <p>Loading counties...</p>
                    ) : (
                      <Form.Select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        required
                      >
                        <option value="">Select County</option>
                        {Array.isArray(counties) &&
                          counties.map((county) => (
                            <option key={county.county_id} value={county.county_id}>
                              {county.county_name}
                            </option>
                          ))}
                      </Form.Select>
                    )}
                  </Form.Group>

                  <Form.Group controlId="formStreetName" className="mt-3">
                    <Form.Label>Street Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="street name"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formBuildingName" className="mt-3">
                    <Form.Label>Building Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="building name"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formHouseNumber" className="mt-3">
                    <Form.Label>House/Apt Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="house or apartment number"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formLandmark" className="mt-3">
                    <Form.Label>Nearest Landmark (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="E.g. Opposite ABC Mall, Near Roundabout"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formTownCity" className="mt-3">
                    <Form.Label>
                      Town/City <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="town or city"
                      value={townCity}
                      onChange={(e) => setTownCity(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* Postal Address */}
                <Col md={6}>
                  <h5 className="mb-3">Postal Address</h5> {/* Title for Postal Address */}
                  <Form.Group controlId="formPOBox">
                    <Form.Label>P.O. Box</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=" P.O. Box 12345"
                      value={poBox}
                      onChange={(e) => setPoBox(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formPostalCode" className="mt-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formPostOffice" className="mt-3">
                    <Form.Label>Post Office Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nairobi"
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                    />
                  </Form.Group>

                 
                </Col>
              </Row>

             <Form.Group className="mt-4">
              <Form.Label className="form-label">Speciality(s)</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {availableDisciplines?.map((disc) => {
                  const isSelected = selectedDisciplines.includes(disc.DisciplineID.toString());
                  return (
                    <Button
                      key={disc.DisciplineID}
                      variant={isSelected ? "primary" : "outline-primary"}
                      onClick={() => handleDisciplineClick(disc.DisciplineID.toString())}
                      className="rounded-pill py-1 px-3 d-flex align-items-center"
                      style={{ 
                        transition: 'all 0.3s ease',
                        borderWidth: '2px',
                        fontWeight: 500,
                        backgroundColor: isSelected ? '#4a90e2' : 'transparent',
                        borderColor: isSelected ? '#4a90e2' : '#dee2e6',
                        color: isSelected ? '#fff' : '#4a5568'
                      }}
                    >
                      {disc.DisciplineName}
                      {isSelected && (
                        <span className="ms-2" style={{ fontSize: '0.8em' }}>✓</span>
                      )}
                    </Button>
                  );
                })}
              </div>
              <Form.Text className="text-muted">Click to select multiple specialties</Form.Text>
            </Form.Group>

              <Button style={{ backgroundColor: "#1e73be" }} type="submit">
                Submit
              </Button>

              {responseMessage && (
                <div className="mt-3 alert alert-info">
                  {responseMessage}
                </div>
              )}
              {/* {responseMessage && setTimeout(() => setResponseMessage(''), 4000)} */}
            </Form>
          )}

          {activeTab === 'created' && (
            <>
        <Row className="mb-4 align-items-center">
            {/* Search Bar */}
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <InputGroup>
                <Form.Control
                  placeholder="Search by Name, Email, or Phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "1rem",
                  }}
                />
                <InputGroup.Text
                  style={{
                    // backgroundColor: "#1e73be",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={iconssearch}
                    alt="Search"
                    style={{ width: "20px", height: "20px" }}
                  />
                </InputGroup.Text>
              </InputGroup>
            </Col>

            {/* Consultant Type Filter */}
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Form.Select
                value={filterConsultantType}
                onChange={(e) => {
                  setFilterConsultantType(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "1rem",
                }}
              >
                <option value="all">All Categories</option>
                {consultantTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Discipline Filter */}
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Form.Select
                value={filterDiscipline}
                onChange={(e) => {
                  setFilterDiscipline(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "1rem",
                }}
              >
                <option value="all">All Specialties</option>
                {Array.isArray(availableDisciplines) &&
                  availableDisciplines.map((disc) => (
                    <option key={disc.DisciplineID} value={disc.DisciplineID}>
                      {disc.DisciplineName}
                    </option>
                  ))}
              </Form.Select>
            </Col>

            {/* Education Level Filter */}
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Form.Select
                value={filterEducationLevel}
                onChange={(e) => {
                  setFilterEducationLevel(e.target.value);
                  setCurrentPage(1); // Reset to the first page when filtering
                }}
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "1rem",
                }}
              >
                <option value="all">All Education Levels</option>
                <option value="PhD">PhD</option>
                <option value="Masters">Masters</option>
                <option value="Bachelors">Bachelors</option>
                <option value="Diploma">Diploma</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
          </Row>
          <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Speciality</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(paginatedConsultants || []).map((consultant, index) => (
                    <tr key={consultant.ConsultantID}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{consultant.ConsultantName}</td>
                      <td>{consultant.consultantType}</td>
                      <td>{consultant.Email}</td>
                      <td>{consultant.phone}</td>
                      <td>
                        {consultant.disciplines?.map((d, i) => (
                          <Badge key={i} bg="secondary" className="me-1">
                            {d}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <div className="d-flex">
                          <Button
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(consultant)}
                            style={{ backgroundColor: "#1e73be", color: "#ffffff" }}
                            >
                            <img src={iconsedit} alt="Edit" style={{ width: '20px', height: '20px' }} />
                            Edit 
                          </Button>
                          <Button
                            className="me-2"
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(consultant.ConsultantID)}
                          >
                            <img src={iconsdelete} alt="Edit" style={{ width: '20px', height: '20px' }} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage}</span>
                <Button
                  variant="outline-primary"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * itemsPerPage >= filteredConsultants.length}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} 
        size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Consultant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingConsultant && renderEditForm()}
          </Modal.Body>
        </Modal>

      </div>
    </>
  );
};

export default Input;